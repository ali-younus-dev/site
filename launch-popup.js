/* ============================================================================
   FOTILE F20 REFRIGERATOR — launch announcement popup (homepage)
   Shows once per browser session; links to /fridge/. Easy to remove after launch.
   ========================================================================== */
(function(){
  try{ if(sessionStorage.getItem('fotile_f20_seen')) return; }catch(e){}
  var B = (window.__PBASE||'');

  var css = ''
  + '.lp-ov{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:24px;'
  +   'background:rgba(5,5,7,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);opacity:0;transition:opacity .5s}'
  + '.lp-ov.show{opacity:1}'
  + '.lp{position:relative;width:100%;max-width:860px;display:grid;grid-template-columns:1.05fr 1fr;'
  +   'background:linear-gradient(145deg,#120c0f,#08080a);border:1px solid rgba(224,30,55,.32);border-radius:18px;overflow:hidden;'
  +   'box-shadow:0 50px 130px rgba(0,0,0,.75),0 0 90px rgba(224,30,55,.12);transform:translateY(24px) scale(.98);transition:transform .55s cubic-bezier(.16,1,.3,1);font-family:Manrope,system-ui,sans-serif}'
  + '.lp-ov.show .lp{transform:none}'
  + '.lp-img{background-size:cover;background-position:center;min-height:340px;position:relative}'
  + '.lp-img::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent 60%,#0a080a)}'
  + '.lp-x{position:absolute;top:14px;right:14px;z-index:3;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.2);'
  +   'background:rgba(8,8,10,.5);color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.25s}'
  + '.lp-x:hover{background:var(--red,#e01e37);border-color:transparent;transform:rotate(90deg)}'
  + '.lp-b{padding:40px 38px;display:flex;flex-direction:column;justify-content:center}'
  + '.lp-k{display:inline-flex;align-items:center;gap:9px;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#ff3d57;font-weight:700;margin-bottom:16px}'
  + '.lp-k .d{width:6px;height:6px;border-radius:50%;background:#e01e37;box-shadow:0 0 10px #e01e37;animation:lpp 1.8s ease-in-out infinite}'
  + '@keyframes lpp{0%,100%{opacity:1}50%{opacity:.4}}'
  + '.lp-b h3{font-size:31px;font-weight:200;letter-spacing:-1.5px;line-height:1.05;color:#fff;margin-bottom:14px}'
  + '.lp-b h3 b{font-weight:700}'
  + '.lp-b p{font-size:14.5px;font-weight:300;color:#b9b5ba;line-height:1.65;margin-bottom:26px}'
  + '.lp-cta{display:inline-flex;align-items:center;gap:9px;background:linear-gradient(135deg,#e01e37,#ff415a);color:#fff;font-weight:600;font-size:14.5px;'
  +   'padding:14px 26px;border-radius:8px;box-shadow:0 14px 34px rgba(224,30,55,.4);transition:.3s;align-self:flex-start;text-decoration:none}'
  + '.lp-cta:hover{transform:translateY(-2px);box-shadow:0 20px 44px rgba(224,30,55,.55)}'
  + '.lp-later{margin-top:16px;font-size:12.5px;color:#8b878c;background:none;border:none;cursor:pointer;align-self:flex-start;letter-spacing:.3px}'
  + '.lp-later:hover{color:#cfccd1}'
  + '@media(max-width:720px){.lp{grid-template-columns:1fr;max-width:420px}.lp-img{min-height:200px}.lp-img::after{background:linear-gradient(180deg,transparent 55%,#0a080a)}.lp-b{padding:30px 26px}.lp-b h3{font-size:26px}}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  function show(){
    var ov=document.createElement('div'); ov.className='lp-ov';
    ov.innerHTML=''
      +'<div class="lp" role="dialog" aria-label="Fotile F20 refrigerator launch">'
      +  '<div class="lp-img" style="background-image:url(\''+B+'assets/launch/coming-soon.jpg\')"></div>'
      +  '<button class="lp-x" aria-label="Close">&#10005;</button>'
      +  '<div class="lp-b">'
      +    '<div class="lp-k"><span class="d"></span>New Launch &middot; Coming Soon</div>'
      +    '<h3>The game changer<br>is <b>coming.</b></h3>'
      +    '<p>Introducing the <b style="color:#fff">Fotile F20</b> — a high-end, fully-embedded refrigerator designed in Berlin, with press-to-open doors and nitrogen fresh-keeping.</p>'
      +    '<a class="lp-cta" href="/fridge/">Discover the F20 &rarr;</a>'
      +    '<button class="lp-later">Maybe later</button>'
      +  '</div>'
      +'</div>';
    document.body.appendChild(ov);
    requestAnimationFrame(function(){ov.classList.add('show');});
    function close(){ try{sessionStorage.setItem('fotile_f20_seen','1');}catch(e){} ov.classList.remove('show'); setTimeout(function(){ov.remove();},450); }
    ov.querySelector('.lp-x').onclick=close;
    ov.querySelector('.lp-later').onclick=close;
    ov.addEventListener('click',function(e){ if(e.target===ov) close(); });
    document.addEventListener('keydown',function esc(e){ if(e.key==='Escape'){close();document.removeEventListener('keydown',esc);} });
    // clicking the CTA also marks as seen
    ov.querySelector('.lp-cta').addEventListener('click',function(){try{sessionStorage.setItem('fotile_f20_seen','1');}catch(e){}});
  }
  function boot(){ setTimeout(show, 1400); }
  if(document.readyState!=='loading') boot(); else document.addEventListener('DOMContentLoaded',boot);
})();
