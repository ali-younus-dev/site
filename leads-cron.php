<?php
/* ============================================================================
   FOTILE PAKISTAN — LEAD FOLLOW-UP CRON
   Run every hour from cPanel → Cron Jobs:
       0 * * * *  php /home/YOURUSER/public_html/leads-cron.php
   What it does each run:
     · day-0 email to any customer whose confirmation email failed at submit
     · day-3 follow-up email to customers who gave an email and are still open
     · once a day (after 9am Pakistan time) a digest to the sales team listing
       the WhatsApp follow-ups due today, with a link to the dashboard
   Command-line only — it refuses to run from a browser.
   ========================================================================== */
if (php_sapi_name() !== 'cli') { http_response_code(404); exit; }
date_default_timezone_set('Asia/Karachi');
require __DIR__ . '/leads-api.php';

$now  = time();
$sent = array('d0' => 0, 'd3' => 0);

withLeads(function (&$data) use ($now, &$sent) {
    foreach ($data as &$l) {
        if (empty($l['email']) || in_array($l['status'], array('won', 'lost', 'closed'), true)) continue;
        $age = $now - $l['created'];
        if (empty($l['fu']['email_d0']) && $age < 2 * 86400) {
            list($s, $t) = customerEmail($l, 'd0');
            if (sendMail($l['email'], $s, $t)) { $l['fu']['email_d0'] = $now; $sent['d0']++; }
        } elseif (empty($l['fu']['email_d3']) && $age >= 3 * 86400 && $age < 10 * 86400) {
            list($s, $t) = customerEmail($l, 'd3');
            if (sendMail($l['email'], $s, $t)) { $l['fu']['email_d3'] = $now; $sent['d3']++; }
        }
    }
    unset($l);
    return true;
});

/* daily WhatsApp digest for the team */
$stateFile = dirname(LEADS_FILE) . '/cron-state.json';
$state = is_file($stateFile) ? (json_decode((string)file_get_contents($stateFile), true) ?: array()) : array();
$today = date('Y-m-d');
if ((int)date('G') >= 9 && ($state['digest'] ?? '') !== $today) {
    $d0 = $d3 = array();
    foreach (readLeads() as $l) {
        $d = dueState($l, $now);
        if ($d === 'd0') $d0[] = $l; elseif ($d === 'd3') $d3[] = $l;
    }
    if ($d0 || $d3) {
        $line = function ($l) { return '  · ' . $l['name'] . ' (' . $l['city'] . ') ' . $l['phone'] . ' — ' . (itemsText($l['items']) ?: $l['reason']); };
        $body = "Good morning,\n\nWhatsApp follow-ups due today:\n\n"
              . ($d0 ? "FIRST CONTACT (" . count($d0) . ")\n" . implode("\n", array_map($line, $d0)) . "\n\n" : '')
              . ($d3 ? "DAY-3 FOLLOW-UP (" . count($d3) . ")\n" . implode("\n", array_map($line, $d3)) . "\n\n" : '')
              . "Open the queue (one tap sends the WhatsApp): " . SITE . "/leads.php\n";
        sendMail(TEAM_EMAIL, 'Fotile: ' . (count($d0) + count($d3)) . ' WhatsApp follow-ups due today', $body);
    }
    $state['digest'] = $today;
    file_put_contents($stateFile, json_encode($state));
}

echo date('c') . " day0=" . $sent['d0'] . " day3=" . $sent['d3'] . "\n";
