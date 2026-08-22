/* ============================================================================
   FOTILE HOMEPAGE 2.0 — premium motion & interactivity (homepage only)
   Additive layer: cursor light · 3D tilt · magnetic buttons · button shine ·
   count-up stats · hero accent shimmer · trust marquee. Fully reversible.
   ========================================================================== */
(function(){
  var TOUCH = window.matchMedia && window.matchMedia('(hover:none)').matches;

  var css = ''
  + '.spot{background:radial-gradient(circle,rgba(224,30,55,.16),rgba(224,30,55,.05) 38%,transparent 66%)!important;opacity:0;transition:opacity .6s;mix-blend-mode:screen}'
  + '.btn-r{position:relative;overflow:hidden;will-change:transform}'
  + '.btn-r::after{content:"";position:absolute;top:0;left:-120%;width:70%;height:100%;background:linear-gradient(120deg,transparent,rgba(255,255,255,.35),transparent);transform:skewX(-18deg);transition:none}'
  + '.btn-r:hover::after{animation:fhShine .85s ease-out}'
  + '@keyframes fhShine{to{left:130%}}'
  + '.accent{background:linear-gradient(100deg,#e01e37 0%,#ff5069 30%,#ffd0d6 50%,#ff5069 70%,#e01e37 100%);background-size:220% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:fhSheen 6s linear infinite}'
  + '@keyframes fhSheen{to{background-position:220% 0}}'
  + '.tile,.pcard{will-change:transform}'
  + '.tile::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .3s;background:radial-gradient(340px circle at var(--gx,50%) var(--gy,0%),rgba(255,255,255,.14),transparent 60%);z-index:4}'
  + '.tile:hover::after{opacity:1}'
  /* trust marquee */
  + '.fh-marquee{position:relative;overflow:hidden;border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08);padding:26px 0;background:linear-gradient(180deg,#0d0e11,#0b0b0d)}'
  + '.fh-marquee::before,.fh-marquee::after{content:"";position:absolute;top:0;bottom:0;width:16%;z-index:2;pointer-events:none}'
  + '.fh-marquee::before{left:0;background:linear-gradient(90deg,#0b0b0d,transparent)}'
  + '.fh-marquee::after{right:0;background:linear-gradient(270deg,#0b0b0d,transparent)}'
  + '.fh-track{display:inline-flex;align-items:center;gap:34px;white-space:nowrap;animation:fhMarq 34s linear infinite;will-change:transform}'
  + '.fh-track span{font-size:clamp(18px,2.4vw,30px);font-weight:300;letter-spacing:-.5px;color:#e9eaee}'
  + '.fh-track span.d{color:var(--red,#e01e37);font-size:14px}'
  + '.fh-track b{font-weight:600}'
  + '@keyframes fhMarq{to{transform:translateX(-50%)}}'
  + '@media(hover:none){.fh-track{animation-duration:22s}}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded',fn); }

  ready(function(){
    /* ---- cursor light ---- */
    if(!TOUCH){
      var spot=document.querySelector('.spot');
      if(spot){
        var tx=innerWidth/2,ty=innerHeight*0.4,cx=tx,cy=ty,seen=false;
        addEventListener('mousemove',function(e){tx=e.clientX;ty=e.clientY;if(!seen){seen=true;spot.style.opacity='1';}},{passive:true});
        (function loop(){cx+=(tx-cx)*0.12;cy+=(ty-cy)*0.12;spot.style.transform='translate('+(cx-320)+'px,'+(cy-320)+'px)';requestAnimationFrame(loop);})();
      }
    }

    /* ---- 3D tilt + glare on cards ---- */
    if(!TOUCH){
      document.querySelectorAll('.tile,.pcard').forEach(function(el){
        var t;
        el.addEventListener('mouseenter',function(){clearTimeout(t);el.style.transition='transform .12s ease-out';});
        el.addEventListener('mousemove',function(e){
          var r=el.getBoundingClientRect();
          var px=(e.clientX-r.left)/r.width-0.5, py=(e.clientY-r.top)/r.height-0.5;
          el.style.transform='perspective(1000px) rotateY('+(px*7).toFixed(2)+'deg) rotateX('+(-py*7).toFixed(2)+'deg) translateY(-8px) scale(1.012)';
          el.style.setProperty('--gx',((e.clientX-r.left)/r.width*100)+'%');
          el.style.setProperty('--gy',((e.clientY-r.top)/r.height*100)+'%');
        });
        el.addEventListener('mouseleave',function(){el.style.transform='';t=setTimeout(function(){el.style.transition='';},260);});
      });
    }

    /* ---- magnetic buttons ---- */
    if(!TOUCH){
      document.querySelectorAll('.btn-r,.hs-cta,.npill,.cbtn').forEach(function(b){
        b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*0.22).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*0.35).toFixed(1)+'px)';});
        b.addEventListener('mouseleave',function(){b.style.transform='';});
      });
    }

    /* ---- count-up stats on scroll ---- */
    function animCount(el){
      var tn=el.firstChild; if(!tn||tn.nodeType!==3) return;
      var m=(tn.textContent||'').match(/^(-?\d+)/); if(!m) return;
      var target=parseInt(m[1],10), suffix=tn.textContent.slice(m[1].length), start=null, dur=1500, neg=target<0, abs=Math.abs(target);
      requestAnimationFrame(function step(ts){ if(!start)start=ts; var p=Math.min(1,(ts-start)/dur);
        var v=Math.round(abs*(1-Math.pow(1-p,3))); tn.textContent=(neg?'-':'')+v+suffix; if(p<1)requestAnimationFrame(step); });
    }
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){animCount(e.target);io.unobserve(e.target);}});},{threshold:.6});
      document.querySelectorAll('.fd-stats b').forEach(function(b){ if(b.firstChild&&/^-?\d/.test(b.firstChild.textContent||'')) io.observe(b); });
    }

    /* ---- trust marquee before footer ---- */
    if(!document.querySelector('.fh-marquee')){
      var items=['<b>Asia&rsquo;s #1</b> Kitchen Brand','20+ Years of Kitchen R&amp;D','Whisper-Quiet Engineering','96% Smoke Capture','Nationwide Warranty &amp; Service','Powerful. Precise. Perfected.'];
      var one=items.map(function(x){return '<span>'+x+'</span><span class="d">&#9670;</span>';}).join('');
      var mq=document.createElement('section'); mq.className='fh-marquee';
      mq.innerHTML='<div class="fh-track" aria-hidden="true">'+one+one+'</div>';
      var ft=document.querySelector('footer');
      if(ft&&ft.parentNode) ft.parentNode.insertBefore(mq,ft); else document.body.appendChild(mq);
    }

    /* ================================================================
       V2 — APPLE-STYLE LAYER (matches the F20 launch page language)
       ================================================================ */
    var v2css=''
      /* scroll progress bar */
      +'.sprog2{position:fixed;top:0;left:0;height:2px;width:0;z-index:4000;background:linear-gradient(90deg,#7a0f1e,#e01e37,#ff5069);box-shadow:0 0 12px rgba(224,30,55,.7);pointer-events:none}'
      /* pill buttons everywhere */
      +'.btn-r,.npill,.cexplore,.hs-cta,.cbtn{border-radius:50px!important}'
      /* softer, larger geometry on stages & cards */
      +'.sc-stage,.pcard .stage,.fres .rstage{border-radius:24px!important}'
      /* statement — Apple scrubbed words */
      +'.statement .big .w2{opacity:.13;transition:opacity .45s ease}'
      +'.statement .big .w2.on{opacity:1}'
      +'.statement .big .w2.hl2{font-weight:500;color:#fff}'
      +'.statement .big .w2.rd2{font-weight:400}'
      +'.statement .big .w2.rd2.on{background:linear-gradient(100deg,#e01e37,#ff8091 50%,#e01e37);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}';
    var v2st=document.createElement('style'); v2st.textContent=v2css; document.head.appendChild(v2st);

    /* scroll progress bar */
    if(!document.querySelector('.sprog2')){
      var pb=document.createElement('div'); pb.className='sprog2'; document.body.appendChild(pb);
      addEventListener('scroll',function(){
        var h=document.documentElement,max=h.scrollHeight-innerHeight;
        pb.style.width=(max>0?(scrollY/max*100):0)+'%';
      },{passive:true});
    }

    /* statement: light words up one by one as you scroll (Apple keynote style) */
    var big=document.querySelector('.statement .big');
    if(big&&!big.__scrubbed){
      big.__scrubbed=1;
      var frag=document.createDocumentFragment();
      Array.prototype.slice.call(big.childNodes).forEach(function(n){
        var isEl=n.nodeType===1;
        var isRd=isEl&&n.classList&&n.classList.contains('rd');
        (n.textContent||'').split(/\s+/).forEach(function(w){
          if(!w) return;
          if(/^[.,;:!?…—–-]+$/.test(w)&&frag.lastElementChild){ frag.lastElementChild.textContent+=w; return; }
          var s=document.createElement('span');
          s.className='w2'+(isEl?(isRd?' rd2':' hl2'):'');
          s.textContent=w;
          frag.appendChild(s); frag.appendChild(document.createTextNode(' '));
        });
      });
      big.innerHTML=''; big.appendChild(frag);
      var ws=big.querySelectorAll('.w2');
      function scrub2(){
        var r=big.getBoundingClientRect();
        var p=(innerHeight*0.85-r.top)/(innerHeight*0.55);
        p=Math.max(0,Math.min(1,p));
        var n=Math.round(p*ws.length);
        for(var i=0;i<ws.length;i++) ws[i].classList.toggle('on',i<n);
      }
      addEventListener('scroll',scrub2,{passive:true}); scrub2();
    }
  });
})();
