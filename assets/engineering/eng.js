/* Fotile Pakistan — Engineering pages: shared behaviour (nav, reveals, counters, overture). New file. */
(function(){
  'use strict';
  var d=document, root=d.documentElement;
  var reduce=false; try{reduce=matchMedia('(prefers-reduced-motion:reduce)').matches}catch(e){}

  /* ---- overture: a seam of light opens the page. Plays once per session; click to skip. ---- */
  var ov=d.getElementById('ov');
  if(ov){
    var seen=false; try{seen=sessionStorage.getItem('fotile_eng_ov')==='1'}catch(e){}
    var q=location.search||'';
    if(reduce||(seen&&q.indexOf('intro=1')<0)||q.indexOf('nointro')>=0){ov.className='ov gone'}
    else{
      root.classList.add('oklock');
      var done=false;
      var finish=function(){
        if(done)return;done=true;
        ov.classList.add('go');
        setTimeout(function(){ov.classList.add('gone');root.classList.remove('oklock')},1150);
        try{sessionStorage.setItem('fotile_eng_ov','1')}catch(e){}
      };
      setTimeout(finish,2300);
      ov.addEventListener('click',finish);
      d.addEventListener('keydown',function(e){if(e.key==='Escape'||e.key===' ')finish()});
    }
  }

  /* ---- nav ---- */
  var nav=d.getElementById('nav');
  if(nav){var on=function(){nav.classList.toggle('solid',(window.scrollY||0)>50)};on();addEventListener('scroll',on,{passive:true})}

  /* ---- reveals + in-view triggers ---- */
  var targets=d.querySelectorAll('.reveal,.io,.noise');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('in','on');io.unobserve(e.target)}
    })},{threshold:.14,rootMargin:'0px 0px -6% 0px'});
    targets.forEach(function(t){io.observe(t)});
  }else{targets.forEach(function(t){t.classList.add('in','on')})}

  /* ---- counters: <b data-count="1700" data-dec="0" data-suf="m³/h"> ---- */
  function fmt(n,dec){var s=n.toFixed(dec||0);return dec?s:s.replace(/\B(?=(\d{3})+(?!\d))/g,',')}
  function runCount(el){
    var to=parseFloat(el.getAttribute('data-count')),dec=+(el.getAttribute('data-dec')||0),
        suf=el.getAttribute('data-suf')||'',pre=el.getAttribute('data-pre')||'';
    var draw=function(v){el.innerHTML=pre+fmt(v,dec)+(suf?'<i>'+suf+'</i>':'')};
    if(reduce){draw(to);return}
    var t0=null,dur=1700;
    (function step(ts){
      if(t0===null)t0=ts;var p=Math.min(1,(ts-t0)/dur),e=1-Math.pow(1-p,4);
      draw(to*e);if(p<1)requestAnimationFrame(step);else draw(to);
    })(performance.now());
  }
  /* Counters keep their real value in the HTML (good for search and for anyone who scrolls fast).
     Only counters still below the fold are reset to 0 and animated when they arrive; any counter
     the reader scrolls past before it fires is simply shown at its final value. */
  var cnt=[].slice.call(d.querySelectorAll('[data-count]')),pending=[];
  function final(el){var to=parseFloat(el.getAttribute('data-count')),dec=+(el.getAttribute('data-dec')||0),suf=el.getAttribute('data-suf')||'';
    el.innerHTML=(el.getAttribute('data-pre')||'')+fmt(to,dec)+(suf?'<i>'+suf+'</i>':'')}
  var vh=window.innerHeight||800;
  cnt.forEach(function(el){
    if(reduce||!('IntersectionObserver' in window)){final(el);return}
    var r=el.getBoundingClientRect();
    if(r.top>vh){var dec=+(el.getAttribute('data-dec')||0),suf=el.getAttribute('data-suf')||'';
      el.innerHTML=(el.getAttribute('data-pre')||'')+fmt(0,dec)+(suf?'<i>'+suf+'</i>':'');pending.push(el)}
    else{runCount(el)}
  });
  if(pending.length){
    var cio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){runCount(e.target);cio.unobserve(e.target);var i=pending.indexOf(e.target);if(i>-1)pending.splice(i,1)}})},{threshold:.2});
    pending.forEach(function(el){cio.observe(el)});
    var sweep=function(){for(var i=pending.length-1;i>=0;i--){var el=pending[i];if(el.getBoundingClientRect().bottom<0){cio.unobserve(el);final(el);pending.splice(i,1)}}if(!pending.length)removeEventListener('scroll',sweep)};
    addEventListener('scroll',sweep,{passive:true});
  }

  /* ---- quote basket helper: <button data-basket="slug"> ---- */
  d.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('[data-basket]'); if(!b)return;
    var slug=b.getAttribute('data-basket'),B=window.FotileBasket;
    if(B&&B.addSlug&&B.addSlug(slug)){e.preventDefault();if(B.open)B.open();}
    else if(b.getAttribute('href')){/* falls through to the product page */}
  });
})();
