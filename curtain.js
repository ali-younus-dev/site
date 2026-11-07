/* =====================================================================
   FOTILE — Launch Curtain for the GitHub preview
   ---------------------------------------------------------------------
   SWITCH:  change ON below to  true  (curtain up) or  false  (site open),
            then Commit + Push in GitHub Desktop. Live in about a minute.

   - While ON, every page sends visitors to the countdown page.
   - It lifts by itself at 12:00 am, 15 Nov 2026 (Pakistan time).
   - Team preview: open the site once with  ?team=fotile2026  at the end
     of the address — that browser sees the real site for 12 hours.
   - On the real fotilepk.com hosting this file does nothing; there the
     dashboard's "Launch Curtain" switch is used instead.
   ===================================================================== */
(function () {
  var ON = true;
  var LAUNCH = Date.parse('2026-11-15T00:00:00+05:00');

  try {
    var host = location.hostname.replace(/^www\./, '');
    if (host === 'fotilepk.com') return;              /* real hosting: .htaccess + dashboard handle it */
    if (!ON || Date.now() >= LAUNCH) return;

    var KEY = 'fotile_team_until';
    if (/[?&]team=fotile2026(&|$)/.test(location.search)) {
      try { localStorage.setItem(KEY, String(Date.now() + 12 * 3600 * 1000)); } catch (e) {}
      return;
    }
    var until = 0; try { until = +localStorage.getItem(KEY) || 0; } catch (e) {}
    if (until > Date.now()) return;

    var me = document.currentScript && document.currentScript.src;
    var target = me ? new URL('maintenance.html', me).href : 'maintenance.html';
    document.documentElement.style.visibility = 'hidden';
    location.replace(target);
  } catch (e) {}
})();
