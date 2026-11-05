<?php
/* ============================================================================
   FOTILE — LEADS & FOLLOW-UP QUEUE (login-protected, same login as dashboard)
   ========================================================================== */
session_name('fotile_admin');
if (session_status() === PHP_SESSION_NONE) {
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    session_set_cookie_params(0, '/', '', $secure, true);
    session_start();
}
if (empty($_SESSION['fotile_admin_ok'])) { header('Location: dashboard.php'); exit; }
header('X-Frame-Options: DENY');
header('Cache-Control: no-store');
?><!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex,nofollow">
<title>Leads — Fotile Control Panel</title>
<style>
  @font-face{font-family:"Manrope";font-style:normal;font-weight:200 800;font-display:swap;src:url("assets/fonts/manrope.woff2") format("woff2")}
  :root{--bg:#09090c;--panel:#121218;--panel2:#181820;--line:rgba(255,255,255,.08);--txt:#f1f1f4;--dim:#9a9aa6;--red:#e01e37;--green:#3ec98a;--amber:#f6c445}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:"Manrope",system-ui,sans-serif;background:var(--bg);color:var(--txt);font-size:14px}
  a{color:inherit}
  header{position:sticky;top:0;z-index:5;background:rgba(9,9,12,.92);backdrop-filter:blur(12px);border-bottom:1px solid var(--line);padding:14px 20px;display:flex;gap:16px;align-items:center;flex-wrap:wrap}
  header img{height:16px;filter:brightness(0) invert(1)}
  header h1{font-size:17px;font-weight:600;margin-right:auto}
  header a.btn,button.btn{background:var(--panel2);border:1px solid var(--line);color:var(--txt);border-radius:8px;padding:9px 14px;font:inherit;font-size:13px;text-decoration:none;cursor:pointer}
  main{max-width:1100px;margin:0 auto;padding:22px 16px 80px}
  .kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:20px}
  .kpi{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px}
  .kpi b{display:block;font-size:26px;font-weight:600}.kpi span{color:var(--dim);font-size:12px}
  .tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
  .tabs button{background:transparent;border:1px solid var(--line);color:var(--dim);border-radius:40px;padding:8px 15px;font:inherit;font-size:13px;cursor:pointer}
  .tabs button[aria-pressed="true"]{background:var(--txt);color:#111;border-color:var(--txt)}
  .search{width:100%;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:11px 14px;color:var(--txt);font:inherit;margin-bottom:16px}
  .lead{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px 18px;margin-bottom:10px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px 18px}
  .lead.due{border-color:rgba(246,196,69,.45)}
  .lead h3{font-size:15.5px;font-weight:600}
  .meta{color:var(--dim);font-size:12.5px;margin-top:3px}
  .items{margin-top:8px;font-size:13.5px;color:#d9d9df}
  .note{margin-top:6px;font-size:13px;color:var(--dim);font-style:italic}
  .tag{display:inline-block;font-size:11px;font-weight:600;border-radius:20px;padding:3px 9px;margin-left:6px;vertical-align:2px;background:rgba(255,255,255,.07);color:var(--dim)}
  .tag.d0{background:rgba(246,196,69,.15);color:var(--amber)}.tag.d3{background:rgba(91,143,249,.15);color:#8fb0ff}
  .acts{display:flex;flex-direction:column;gap:7px;align-items:stretch;min-width:190px}
  .acts a,.acts button,.acts select{font:inherit;font-size:13px;border-radius:8px;padding:9px 12px;text-align:center;text-decoration:none;cursor:pointer;border:1px solid var(--line);background:var(--panel2);color:var(--txt)}
  .acts .wa{background:#1f9d57;border-color:#1f9d57;color:#fff;font-weight:600}
  .acts .done{opacity:.55}
  .fu{font-size:11.5px;color:var(--dim);margin-top:8px}
  .fu b{color:var(--green);font-weight:600}
  .empty{color:var(--dim);text-align:center;padding:60px 0}
  textarea{width:100%;margin-top:8px;background:var(--panel2);border:1px solid var(--line);border-radius:8px;color:var(--txt);font:inherit;font-size:13px;padding:8px 10px;min-height:38px}
  @media(max-width:720px){.kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.lead{grid-template-columns:minmax(0,1fr)}.acts{min-width:0}}
</style>
</head><body>
<header>
  <img src="assets/logo.png" alt="Fotile"><h1>Leads &amp; follow-ups</h1>
  <a class="btn" href="leads-api.php?action=export">Download CSV</a>
  <a class="btn" href="dashboard.php">← Dashboard</a>
</header>
<main>
  <div class="kpis">
    <div class="kpi"><b id="kD0">–</b><span>First contact due</span></div>
    <div class="kpi"><b id="kD3">–</b><span>Day-3 follow-up due</span></div>
    <div class="kpi"><b id="kWeek">–</b><span>Leads in the last 7 days</span></div>
    <div class="kpi"><b id="kWon">–</b><span>Marked won (all time)</span></div>
  </div>
  <div class="tabs" role="group" aria-label="Filter leads">
    <button type="button" data-f="due" aria-pressed="true">Due today</button>
    <button type="button" data-f="open" aria-pressed="false">All open</button>
    <button type="button" data-f="all" aria-pressed="false">Everything</button>
  </div>
  <input class="search" id="q" type="search" placeholder="Search name, phone, city, product or reference">
  <div id="list"><p class="empty">Loading…</p></div>
</main>
<script>
(function(){
var TOKEN=<?php echo json_encode($_SESSION['fotile_token'] ?? ''); ?>, L=[], F='due';
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return '&#'+c.charCodeAt(0)+';';});};
var ago=function(t){var s=Math.floor(Date.now()/1000)-t;if(s<3600)return Math.max(1,Math.round(s/60))+' min ago';if(s<86400)return Math.round(s/3600)+' h ago';return Math.round(s/86400)+' days ago';};
var day=function(t){return t?new Date(t*1000).toLocaleString('en-PK',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'';};
function items(l){return (l.items||[]).map(function(i){return i.qty+' × '+i.name;}).join(', ');}
function msg(l,stage){
  var first=(l.name||'').split(' ')[0], it=items(l);
  if(stage==='d0') return 'Assalam o Alaikum '+first+', this is Fotile Pakistan. Thank you for your enquiry'+(it?' about '+it:'')+' (ref '+l.ref+'). I can share today\'s price, any running offer and installation details — when is a good time to talk?';
  return 'Assalam o Alaikum '+first+', Fotile Pakistan again about your enquiry'+(it?' for '+it:'')+' (ref '+l.ref+'). Do you have any questions on sizes, delivery or installation? Happy to arrange a showroom visit or a call.';
}
function api(body){return fetch('leads-api.php?action=update',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-Fotile-Token':TOKEN},body:JSON.stringify(body)}).then(function(r){return r.json();});}
function render(){
  var q=(document.getElementById('q').value||'').toLowerCase();
  var rows=L.filter(function(l){
    if(F==='due'&&l.due==='none')return false;
    if(F==='open'&&['won','lost','closed'].indexOf(l.status)>-1)return false;
    return !q||[l.name,l.phone,l.city,l.ref,items(l),l.email].join(' ').toLowerCase().indexOf(q)>-1;});
  document.getElementById('list').innerHTML=rows.length?rows.map(function(l){
    var stage=l.due==='d3'?'d3':'d0', fu=l.fu||{};
    var wa='https://wa.me/'+l.phone_wa+'?text='+encodeURIComponent(msg(l,stage));
    var log=[fu.wa_d0&&'WhatsApp day 0 <b>✓</b> '+day(fu.wa_d0),fu.wa_d3&&'WhatsApp day 3 <b>✓</b> '+day(fu.wa_d3),fu.email_d0&&'Email day 0 <b>✓</b>',fu.email_d3&&'Email day 3 <b>✓</b>',fu.called&&'Called <b>✓</b> '+day(fu.called)].filter(Boolean).join(' · ');
    return '<article class="lead'+(l.due!=='none'?' due':'')+'" data-id="'+esc(l.id)+'"><div>'
      +'<h3>'+esc(l.name)+(l.due==='d0'?'<span class="tag d0">First contact due</span>':l.due==='d3'?'<span class="tag d3">Day-3 follow-up</span>':'')+'<span class="tag">'+esc(l.status)+'</span></h3>'
      +'<div class="meta">'+esc(l.phone)+' · '+esc(l.city||'—')+(l.email?' · '+esc(l.email):'')+' · '+esc(l.source.replace(/_/g,' '))+' · '+ago(l.created)+' · '+esc(l.ref)+'</div>'
      +(items(l)?'<div class="items">'+esc(items(l))+'</div>':(l.reason?'<div class="items">'+esc(l.reason)+'</div>':''))
      +(l.note?'<div class="note">“'+esc(l.note)+'”</div>':'')
      +'<div class="fu">'+(log||'No follow-up yet')+'</div>'
      +'<textarea data-note placeholder="Team note (saved when you click away)">'+esc(l.note_admin||'')+'</textarea>'
      +'</div><div class="acts">'
      +(l.due!=='none'?'<a class="wa" href="'+esc(wa)+'" target="_blank" rel="noopener" data-mark="wa_'+stage+'">Send WhatsApp ('+(stage==='d0'?'day 0':'day 3')+')</a>':'<a href="'+esc('https://wa.me/'+l.phone_wa)+'" target="_blank" rel="noopener">Open WhatsApp chat</a>')
      +'<a href="tel:+'+esc(l.phone_wa)+'" data-mark="called">Call</a>'
      +'<select data-status aria-label="Status">'+['new','contacted','quoted','won','lost','closed'].map(function(s){return '<option'+(s===l.status?' selected':'')+'>'+s+'</option>';}).join('')+'</select>'
      +'</div></article>';}).join(''):'<p class="empty">'+(F==='due'?'Nothing due — every lead has been followed up. 🎉':'No leads yet.')+'</p>';
}
function kpis(){
  var now=Date.now()/1000;
  document.getElementById('kD0').textContent=L.filter(function(l){return l.due==='d0';}).length;
  document.getElementById('kD3').textContent=L.filter(function(l){return l.due==='d3';}).length;
  document.getElementById('kWeek').textContent=L.filter(function(l){return now-l.created<7*86400;}).length;
  document.getElementById('kWon').textContent=L.filter(function(l){return l.status==='won';}).length;
}
function load(){fetch('leads-api.php?action=list',{credentials:'same-origin'}).then(function(r){if(r.status===401){location.href='dashboard.php';return null;}return r.json();}).then(function(j){if(!j)return;L=j.leads||[];if(j.token)TOKEN=j.token;kpis();render();}).catch(function(){document.getElementById('list').innerHTML='<p class="empty">Could not load leads.</p>';});}
document.querySelector('.tabs').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;F=b.dataset.f;document.querySelectorAll('.tabs button').forEach(function(x){x.setAttribute('aria-pressed',String(x===b));});render();});
document.getElementById('q').addEventListener('input',render);
var list=document.getElementById('list');
list.addEventListener('click',function(e){var a=e.target.closest('[data-mark]');if(!a)return;var id=a.closest('.lead').dataset.id;api({id:id,mark:a.dataset.mark}).then(function(){setTimeout(load,400);});});
list.addEventListener('change',function(e){var s=e.target.closest('[data-status]');if(!s)return;api({id:s.closest('.lead').dataset.id,status:s.value}).then(load);});
list.addEventListener('focusout',function(e){var t=e.target.closest('[data-note]');if(!t)return;api({id:t.closest('.lead').dataset.id,note_admin:t.value});});
load(); setInterval(load,120000);
})();
</script>
</body></html>
