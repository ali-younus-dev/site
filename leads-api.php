<?php
/* ============================================================================
   FOTILE PAKISTAN — LEADS API
   ----------------------------------------------------------------------------
   Public:   POST ?action=submit   — the quote basket and contact form send a
                                     copy of every enquiry here (fire-and-forget)
   Admin:    GET  ?action=list     — leads + what is due (needs dashboard login)
             POST ?action=update   — mark a follow-up sent / change status
             GET  ?action=export   — CSV download
   Leads are stored as JSON OUTSIDE the web root when the host allows it
   (../fotile-leads/), otherwise in ./.leads/ which .htaccess blocks.
   No passwords or secrets live in this file — login is the dashboard session.
   ========================================================================== */

/* ---------------------------------------------------------------- settings */
define('TEAM_EMAIL',  'sarfrazahmed@fotile.pk');          // gets a copy of every lead + the daily digest
define('FROM_EMAIL',  'noreply@fotilepk.com');            // must be a mailbox/domain your host may send for
define('REPLY_EMAIL', 'sarfrazahmed@fotile.pk');
define('WHATSAPP',    '923008463129');                    // business WhatsApp (shown in customer emails)
define('UAN',         '042-111-131-517');
define('SITE',        'https://fotilepk.com');
define('MAX_PER_HOUR_PER_IP', 12);

function leadsDir() {
    $outside = dirname(__DIR__) . '/fotile-leads';
    if (is_dir($outside) && is_writable($outside)) return $outside;
    if (!is_dir($outside) && is_writable(dirname(__DIR__)) && @mkdir($outside, 0750, true)) return $outside;
    $inside = __DIR__ . '/.leads';
    if (!is_dir($inside)) {
        @mkdir($inside, 0750, true);
        @file_put_contents($inside . '/.htaccess', "Require all denied\nDeny from all\n");
        @file_put_contents($inside . '/index.html', '');
    }
    return $inside;
}
define('LEADS_FILE', leadsDir() . '/leads.json');
define('RATE_FILE',  leadsDir() . '/rate.json');

/* ---------------------------------------------------------------- helpers */
if (php_sapi_name() !== 'cli' && basename($_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__)) {
    if (session_status() === PHP_SESSION_NONE) {
        session_name('fotile_admin');
        $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
        session_set_cookie_params(0, '/', '', $secure, true);
        session_start();
    }
}
function out($a, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: no-store');
    echo json_encode($a);
    exit;
}
function fail($m, $code = 400) { out(array('ok' => false, 'error' => $m), $code); }
function isAdmin() { return !empty($_SESSION['fotile_admin_ok']); }
function requireAdmin() { if (!isAdmin()) fail('Not signed in.', 401); }
function requireToken() {
    $sent = $_SERVER['HTTP_X_FOTILE_TOKEN'] ?? '';
    if (empty($_SESSION['fotile_token']) || !hash_equals($_SESSION['fotile_token'], $sent)) fail('Security token mismatch. Reload and sign in again.', 403);
}
function clean($v, $max) {
    $v = is_scalar($v) ? (string)$v : '';
    $v = trim(preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $v));
    return mb_substr($v, 0, $max);
}
function normPhone($p) {
    $d = preg_replace('/[^0-9+]/', '', (string)$p);
    $d = preg_replace('/^\+/', '', $d);
    if (strpos($d, '0092') === 0) $d = substr($d, 2);
    if (strpos($d, '0') === 0) $d = '92' . substr($d, 1);
    return $d;
}
function phoneOk($p) { return (bool)preg_match('/^92\d{9,10}$/', normPhone($p)); }

/* locked read-modify-write of the JSON store */
function withLeads(callable $fn) {
    $fh = fopen(LEADS_FILE, 'c+');
    if (!$fh) fail('Storage unavailable.', 500);
    flock($fh, LOCK_EX);
    $raw = stream_get_contents($fh);
    $data = json_decode($raw ?: '[]', true);
    if (!is_array($data)) $data = array();
    $res = $fn($data);
    if ($res !== false) {
        ftruncate($fh, 0); rewind($fh);
        fwrite($fh, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        fflush($fh);
    }
    flock($fh, LOCK_UN); fclose($fh);
    return $res;
}
function readLeads() {
    if (!is_file(LEADS_FILE)) return array();
    $d = json_decode((string)@file_get_contents(LEADS_FILE), true);
    return is_array($d) ? $d : array();
}
function rateOk($ip) {
    $now = time(); $r = array();
    if (is_file(RATE_FILE)) { $r = json_decode((string)@file_get_contents(RATE_FILE), true) ?: array(); }
    foreach ($r as $k => $ts) { $r[$k] = array_values(array_filter((array)$ts, function ($t) use ($now) { return $t > $now - 3600; })); if (!$r[$k]) unset($r[$k]); }
    $key = hash('sha256', $ip);
    $n = isset($r[$key]) ? count($r[$key]) : 0;
    if ($n >= MAX_PER_HOUR_PER_IP) return false;
    $r[$key][] = $now;
    @file_put_contents(RATE_FILE, json_encode($r), LOCK_EX);
    return true;
}
function itemsText($items) {
    $o = array();
    foreach ((array)$items as $it) $o[] = ($it['qty'] ?? 1) . ' × ' . ($it['name'] ?? $it['slug'] ?? '');
    return implode(', ', $o);
}

/* ---------------------------------------------------------------- email */
function sendMail($to, $subject, $text) {
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) return false;
    $headers = "From: Fotile Pakistan <" . FROM_EMAIL . ">\r\n"
             . "Reply-To: " . REPLY_EMAIL . "\r\n"
             . "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n";
    $subject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    return @mail($to, $subject, $text, $headers, '-f' . FROM_EMAIL);
}
function customerEmail($lead, $stage) {
    $first = preg_split('/\s+/', $lead['name'])[0];
    $items = itemsText($lead['items']);
    $wa    = 'https://wa.me/' . WHATSAPP;
    if ($stage === 'd0') {
        $subj = 'Your Fotile quote request ' . $lead['ref'];
        $body = "Dear $first,\n\nThank you for your interest in Fotile. We have received your request"
              . ($items ? " for:\n\n  $items\n\n" : ".\n\n")
              . "Our team will contact you today with pricing, current offers and installation details.\n\n"
              . "Need it sooner? WhatsApp us: $wa\nOr call " . UAN . ".\n\n"
              . "Every Fotile appliance from Fotile Pakistan carries the authorised manufacturer warranty, with genuine parts and service centres in Karachi, Lahore, Islamabad and Multan.\n\n"
              . "Reference: " . $lead['ref'] . "\n\nFotile Pakistan\n" . SITE . "\n";
    } else {
        $subj = 'Still deciding? Your Fotile quote ' . $lead['ref'];
        $body = "Dear $first,\n\nA few days ago you asked about"
              . ($items ? " $items" : " Fotile appliances")
              . ". Do you have any questions we can answer — sizes, installation, delivery or a showroom visit?\n\n"
              . "Reply to this email, WhatsApp us at $wa or call " . UAN . " and we'll help straight away.\n\n"
              . "Find a showroom: " . SITE . "/our-dealers/\n\n"
              . "Reference: " . $lead['ref'] . "\n\nFotile Pakistan\n";
    }
    return array($subj, $body);
}
function teamEmail($lead) {
    $body = "New website lead (" . $lead['source'] . ")\n\n"
          . "Name:  " . $lead['name'] . "\nPhone: " . $lead['phone'] . "\nCity:  " . $lead['city'] . "\nEmail: " . ($lead['email'] ?: '-') . "\n"
          . "Items: " . (itemsText($lead['items']) ?: '-') . "\nNote:  " . ($lead['note'] ?: '-') . "\nRef:   " . $lead['ref'] . "\nPage:  " . $lead['page'] . "\n\n"
          . "Follow up today in the dashboard: " . SITE . "/leads.php\n";
    sendMail(TEAM_EMAIL, 'New lead ' . $lead['ref'] . ' — ' . $lead['name'], $body);
}

/* what is due for one lead (all times in Pakistan time) */
function dueState($l, $now = null) {
    $now = $now ?: time();
    $closed = in_array($l['status'], array('won', 'lost', 'closed'), true);
    $age = $now - $l['created'];
    $d0 = empty($l['fu']['wa_d0']);
    $d3 = empty($l['fu']['wa_d3']);
    if ($closed) return 'none';
    if ($d0) return 'd0';
    if ($d3 && $age >= 3 * 86400) return 'd3';
    return 'none';
}

if (php_sapi_name() === 'cli' || basename($_SERVER['SCRIPT_FILENAME'] ?? '') !== basename(__FILE__)) return; // included by leads-cron.php

/* ---------------------------------------------------------------- router */
date_default_timezone_set('Asia/Karachi');
$action = $_GET['action'] ?? '';

switch ($action) {

case 'submit':
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('POST only.', 405);
    $raw = file_get_contents('php://input');
    if (strlen($raw) > 20000) fail('Too large.', 413);
    $b = json_decode($raw, true);
    if (!is_array($b)) fail('Bad request.');
    if (!empty($b['website'])) out(array('ok' => true));          // honeypot: pretend success
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0';
    if (!rateOk($ip)) fail('Too many requests.', 429);

    $lead = array(
        'id'      => bin2hex(random_bytes(8)),
        'ref'     => preg_match('/^FT-[0-9]{6,10}$/', $b['ref'] ?? '') ? $b['ref'] : 'FT-' . substr((string)time(), -6) . random_int(10, 99),
        'created' => time(),
        'source'  => in_array($b['source'] ?? '', array('quote_whatsapp', 'quote_email', 'contact', 'service', 'demo'), true) ? $b['source'] : 'contact',
        'name'    => clean($b['name'] ?? '', 80),
        'phone'   => clean($b['phone'] ?? '', 24),
        'city'    => clean($b['city'] ?? '', 40),
        'email'   => filter_var(clean($b['email'] ?? '', 120), FILTER_VALIDATE_EMAIL) ?: '',
        'note'    => clean($b['note'] ?? '', 600),
        'reason'  => clean($b['reason'] ?? '', 60),
        'page'    => clean($b['page'] ?? '', 200),
        'landing' => clean($b['landing'] ?? '', 300),
        'items'   => array(),
        'status'  => 'new',
        'fu'      => array(),
        'log'     => array(),
    );
    foreach (array_slice((array)($b['items'] ?? array()), 0, 40) as $it) {
        if (!is_array($it)) continue;
        $lead['items'][] = array('slug' => clean($it['slug'] ?? '', 80), 'name' => clean($it['name'] ?? '', 120), 'qty' => max(1, min(99, (int)($it['qty'] ?? 1))));
    }
    if ($lead['name'] === '' || !phoneOk($lead['phone'])) fail('Name and a valid phone number are required.');

    $merged = withLeads(function (&$data) use (&$lead) {
        // same customer + same reference within a day = one enquiry (e.g. WhatsApp then email)
        foreach ($data as &$x) {
            if ($x['ref'] === $lead['ref'] && normPhone($x['phone']) === normPhone($lead['phone'])) {
                $x['source'] = $x['source'] . '+' . $lead['source'];
                if (!$x['email'] && $lead['email']) $x['email'] = $lead['email'];
                $lead = $x; return 'merged';
            }
        }
        unset($x);
        array_unshift($data, $lead);
        if (count($data) > 5000) $data = array_slice($data, 0, 5000);
        return 'new';
    });

    if ($merged === 'new') {
        teamEmail($lead);
        if ($lead['email']) {
            list($s, $t) = customerEmail($lead, 'd0');
            if (sendMail($lead['email'], $s, $t)) {
                withLeads(function (&$data) use ($lead) { foreach ($data as &$x) if ($x['id'] === $lead['id']) $x['fu']['email_d0'] = time(); return true; });
            }
        }
    }
    out(array('ok' => true, 'ref' => $lead['ref']));

case 'list':
    requireAdmin();
    $now = time(); $all = readLeads();
    foreach ($all as &$l) { $l['due'] = dueState($l, $now); $l['phone_wa'] = normPhone($l['phone']); }
    unset($l);
    out(array('ok' => true, 'now' => $now, 'leads' => $all, 'token' => $_SESSION['fotile_token'] ?? ''));

case 'update':
    requireAdmin(); requireToken();
    $b = json_decode(file_get_contents('php://input'), true) ?: array();
    $id = (string)($b['id'] ?? '');
    $ok = withLeads(function (&$data) use ($b, $id) {
        foreach ($data as &$x) {
            if ($x['id'] !== $id) continue;
            if (!empty($b['mark']) && in_array($b['mark'], array('wa_d0', 'wa_d3', 'called'), true)) { $x['fu'][$b['mark']] = time(); if ($x['status'] === 'new') $x['status'] = 'contacted'; }
            if (!empty($b['unmark']) && in_array($b['unmark'], array('wa_d0', 'wa_d3', 'called'), true)) unset($x['fu'][$b['unmark']]);
            if (isset($b['status']) && in_array($b['status'], array('new', 'contacted', 'quoted', 'won', 'lost', 'closed'), true)) $x['status'] = $b['status'];
            if (isset($b['note_admin'])) $x['note_admin'] = clean($b['note_admin'], 1000);
            $x['log'][] = array(time(), clean($b['mark'] ?? ($b['status'] ?? 'note'), 20));
            return true;
        }
        return false;
    });
    if ($ok === false) fail('Lead not found.', 404);
    out(array('ok' => true));

case 'export':
    requireAdmin();
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="fotile-leads-' . date('Y-m-d') . '.csv"');
    $f = fopen('php://output', 'w');
    fwrite($f, "\xEF\xBB\xBF");
    fputcsv($f, array('Received', 'Ref', 'Source', 'Status', 'Name', 'Phone', 'City', 'Email', 'Items', 'Customer note', 'Team note', 'WA day 0', 'WA day 3', 'Email day 0', 'Email day 3', 'Landing page'));
    $t = function ($v) { return $v ? date('Y-m-d H:i', $v) : ''; };
    foreach (readLeads() as $l) {
        $row = array(date('Y-m-d H:i', $l['created']), $l['ref'], $l['source'], $l['status'], $l['name'], $l['phone'], $l['city'], $l['email'], itemsText($l['items']), $l['note'], $l['note_admin'] ?? '',
            $t($l['fu']['wa_d0'] ?? 0), $t($l['fu']['wa_d3'] ?? 0), $t($l['fu']['email_d0'] ?? 0), $t($l['fu']['email_d3'] ?? 0), $l['landing']);
        // stop spreadsheet formula injection
        $row = array_map(function ($c) { $c = (string)$c; return preg_match('/^[=+\-@]/', $c) ? "'" . $c : $c; }, $row);
        fputcsv($f, $row);
    }
    fclose($f); exit;

default:
    fail('Unknown action.', 404);
}
