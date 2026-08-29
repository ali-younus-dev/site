/* ============================================================================
   FOTILE — PRODUCT 360 STUDIO
   A drag-to-rotate product viewer for product detail pages.

   • Spin  : drag / swipe horizontally to turn the product, like a turntable
   • Angles: a thumbnail rail to jump straight to a view
   • Finish: pills to switch colour/finish variants (e.g. Silver / Rose Gold)
   • Zoom  : click the product to open a full-screen look
   • Hint  : spins itself once when it first scrolls into view, so people
             discover it is interactive

   HOW TO ADD MORE PRODUCTS
   -------------------------------------------------------------------------
   Everything is driven by the VIEWS map below — no page needs editing.
   Add an entry keyed by the product's slug (the folder name under /shop/):

       'my-product-slug': {
          angles:[ {src:'assets/products/my-product-1.png', name:'Front'},
                   {src:'assets/products/my-product-2.png', name:'Side'} ],
          finishes:[ {name:'Silver',    src:'assets/products/my-silver.png'},
                     {name:'Rose Gold', src:'assets/products/my-rose.png'} ]
       }

   Use `angles` for multiple views of the same product, `finishes` for colour
   variants. A product can have either, or both. Paths are relative to the
   site root — the script adds the correct prefix automatically.
   ========================================================================== */
(function(){
  'use strict';

  var VIEWS = {

    /* Range Hood 9050 — studio angles from Fotile China */
    'range-hood-9050':{
      angles:[
        {src:'assets/products/range-hood-9050-1.webp', name:'Front'},
        {src:'assets/products/range-hood-9050-2.webp', name:'Angle'},
        {src:'assets/products/range-hood-9050-3.webp', name:'Panel'}
      ]
    },

    /* Gas Hob GAL90506 — four angles around the hob */
    'gas-hob-gal90506':{
      angles:[
        {src:'assets/products/gas-hob-gal90506-1.webp', name:'Top'},
        {src:'assets/products/gas-hob-gal90506-2.webp', name:'Left'},
        {src:'assets/products/gas-hob-gal90506-3.webp', name:'Right'},
        {src:'assets/products/gas-hob-gal90506-4.webp', name:'Angle'}
      ]
    },

    /* Built-in Oven KSG7003AT-Y — handle finishes */
    'electric-built-in-oven-ksg7003at-y':{
      finishes:[
        {name:'Silver', src:'assets/products/electric-built-in-oven-ksg7003at-y-silver.webp'},
        {name:'Rose Gold', src:'assets/products/electric-built-in-oven-ksg7003at-y-rosegold.webp'}
      ]
    },

    /* Microwave 25800K-C2G — trim finishes */
    'microwave-oven-25800k-c2g':{
      finishes:[
        {name:'Silver',    src:'assets/products/microwave-oven-25800k-c2g-silver.webp'},
        {name:'Rose Gold', src:'assets/products/microwave-oven-25800k-c2g-rosegold.webp'}
      ]
    }

  };

  /* ---------------------------------------------------------------- setup */
  var stage = document.querySelector('.pdp-stage');
  if(!stage) return;

  var m = (location.pathname||'').match(/\/shop\/([^\/]+)\/?/);
  var slug = m ? m[1].replace(/\.html$/,'') : '';
  var data = VIEWS[slug];
  if(!data) return;                       // product has no extra views — leave the page alone

  var B = window.__PBASE || '';
  var baseImg = stage.querySelector('img');
  var baseSrc = baseImg ? baseImg.getAttribute('src') : '';

  /* Frames are either the angle set or the finish set. `isFinish` changes the
     wording and shows selectable pills instead of a "drag to rotate" prompt. */
  var isFinish = !(data.angles && data.angles.length);
  var list = isFinish ? (data.finishes||[]) : data.angles;
  var frames = list.map(function(a){ return {src:B+a.src, name:a.name}; });
  if(frames.length < 2) return;           // nothing to show off

  /* ------------------------------------------------------------------ css */
  var css = ''
  + '.pg-wrap{position:absolute;inset:0;z-index:2;display:flex;align-items:center;justify-content:center;touch-action:pan-y;cursor:grab;user-select:none;-webkit-user-select:none}'
  + '.pg-wrap.dragging{cursor:grabbing}'
  + '.pg-frame{position:absolute;max-width:82%;max-height:80%;width:auto;height:auto;object-fit:contain;opacity:0;transition:opacity .18s linear;pointer-events:none;'
  +   'filter:drop-shadow(0 30px 44px rgba(0,0,0,.5))}'
  + '.pg-frame.on{opacity:1}'
  /* stage column so the rail sits under the image, not in the next grid cell */
  + '.pg-col{display:flex;flex-direction:column}'
  + '.pg-col .pdp-stage{outline:none}'
  + '.pg-col .pdp-stage:focus-visible{outline:2px solid rgba(224,30,55,.7);outline-offset:3px}'
  /* top-right finish pills */
  + '.pg-fin{position:absolute;top:14px;right:14px;z-index:6;display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end;max-width:70%}'
  + '.pg-fin button{font:600 11.5px/1 Manrope,system-ui,sans-serif;letter-spacing:.3px;color:#d8d5da;background:rgba(10,10,12,.62);'
  +   'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.16);border-radius:50px;padding:8px 14px;cursor:pointer;transition:.25s;white-space:nowrap}'
  + '.pg-fin button:hover{border-color:rgba(224,30,55,.55);color:#fff}'
  + '.pg-fin button.on{background:linear-gradient(135deg,#e01e37,#b3162b);border-color:transparent;color:#fff;box-shadow:0 8px 20px rgba(224,30,55,.35)}'
  /* bottom bar: hint + dots */
  + '.pg-bar{position:absolute;left:0;right:0;bottom:12px;z-index:6;display:flex;flex-direction:column;align-items:center;gap:9px;pointer-events:none}'
  + '.pg-hint{display:inline-flex;align-items:center;gap:8px;font:700 10px/1 Manrope,system-ui,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#cfccd1;'
  +   'background:rgba(10,10,12,.55);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.13);border-radius:50px;padding:7px 14px;transition:opacity .45s}'
  + '.pg-hint .sp{display:inline-block;animation:pgSpin 2.4s ease-in-out infinite}'
  + '@keyframes pgSpin{0%,100%{transform:translateX(-3px)}50%{transform:translateX(3px)}}'
  + '.pg-wrap.touched .pg-hint{opacity:0}'
  + '.pg-dots{display:flex;gap:6px;pointer-events:auto}'
  + '.pg-dots i{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.24);cursor:pointer;transition:.25s}'
  + '.pg-dots i.on{background:#e01e37;box-shadow:0 0 9px rgba(224,30,55,.9);transform:scale(1.25)}'
  /* thumbnail rail under the stage */
  + '.pg-rail{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap}'
  + '.pg-rail button{position:relative;width:74px;height:60px;border-radius:12px;cursor:pointer;padding:6px;'
  +   'background:linear-gradient(180deg,#141419,#0d0d11);border:1px solid rgba(255,255,255,.10);transition:.3s;display:flex;align-items:center;justify-content:center}'
  + '.pg-rail button:hover{border-color:rgba(224,30,55,.45);transform:translateY(-2px)}'
  + '.pg-rail button.on{border-color:#e01e37;box-shadow:0 6px 18px rgba(224,30,55,.25)}'
  + '.pg-rail img{max-width:100%;max-height:100%;object-fit:contain;display:block}'
  + '.pg-rail .lbl{position:absolute;bottom:-17px;left:0;right:0;text-align:center;font:600 9.5px/1 Manrope,system-ui,sans-serif;letter-spacing:.6px;text-transform:uppercase;color:#7c7880;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
  + '.pg-rail button.on .lbl{color:#e6e3e8}'
  + '.pg-railwrap{margin-top:16px;margin-bottom:22px}'
  + '.pg-railwrap .cnt{font:700 9.5px/1 Manrope,system-ui,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#6f6b73;margin-bottom:11px}'
  /* zoom lightbox */
  + '.pg-zoom{position:fixed;inset:0;z-index:2147483000;background:rgba(5,5,7,.94);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);'
  +   'display:flex;align-items:center;justify-content:center;padding:5vh 5vw;opacity:0;transition:opacity .35s}'
  + '.pg-zoom.show{opacity:1}'
  + '.pg-zoom img{max-width:100%;max-height:100%;object-fit:contain}'
  + '.pg-zoom .x{position:absolute;top:22px;right:24px;width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.22);'
  +   'background:rgba(12,12,14,.6);color:#fff;font-size:17px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.25s}'
  + '.pg-zoom .x:hover{background:#e01e37;border-color:transparent;transform:rotate(90deg)}'
  + '.pg-zoom .cap{position:absolute;bottom:26px;left:0;right:0;text-align:center;font:600 11px/1 Manrope,system-ui,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#9a969b}'
  + '@media(max-width:640px){.pg-rail button{width:60px;height:50px}.pg-fin{top:10px;right:10px}.pg-fin button{font-size:10.5px;padding:7px 11px}}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  /* ----------------------------------------------------------------- DOM */
  if(baseImg) baseImg.style.display='none';

  var wrap=document.createElement('div'); wrap.className='pg-wrap';
  var imgs=[];
  frames.forEach(function(f,i){
    var im=document.createElement('img');
    im.className='pg-frame'+(i===0?' on':'');
    im.src=f.src; im.alt=(document.title||'Fotile product')+' — '+f.name;
    im.loading='eager';
    wrap.appendChild(im); imgs.push(im);
  });

  var bar=document.createElement('div'); bar.className='pg-bar';
  var hint=document.createElement('div'); hint.className='pg-hint';
  hint.innerHTML='<span class="sp">&#8596;</span>'+(isFinish?'Drag to change finish':'Drag to rotate');
  var dots=document.createElement('div'); dots.className='pg-dots';
  frames.forEach(function(_,i){
    var d=document.createElement('i'); if(i===0)d.className='on';
    d.addEventListener('click',function(e){e.stopPropagation();touch();go(i);});
    dots.appendChild(d);
  });
  bar.appendChild(hint); bar.appendChild(dots);

  stage.appendChild(wrap); stage.appendChild(bar);

  /* finish pills, top-right of the stage */
  var pills=null;
  if(isFinish){
    pills=document.createElement('div'); pills.className='pg-fin';
    frames.forEach(function(f,i){
      var b=document.createElement('button'); b.type='button'; b.textContent=f.name;
      if(i===0)b.className='on';
      b.addEventListener('click',function(e){e.stopPropagation();touch();go(i);});
      pills.appendChild(b);
    });
    stage.appendChild(pills);
  }

  /* thumbnail rail, in a column directly under the stage */
  var col=document.createElement('div'); col.className='pg-col';
  if(stage.parentNode){
    stage.parentNode.insertBefore(col, stage);
    col.appendChild(stage);
  }
  var railWrap=document.createElement('div'); railWrap.className='pg-railwrap';
  var cnt=document.createElement('div'); cnt.className='cnt';
  cnt.textContent = isFinish ? frames.length+' finishes' : frames.length+' views · drag the image to rotate';
  var rail=document.createElement('div'); rail.className='pg-rail';
  frames.forEach(function(f,i){
    var b=document.createElement('button'); b.type='button';
    b.setAttribute('aria-label','Show '+f.name);
    if(i===0)b.className='on';
    b.innerHTML='<img src="'+f.src+'" alt="" loading="lazy"><span class="lbl">'+f.name+'</span>';
    b.addEventListener('click',function(){touch();go(i);});
    rail.appendChild(b);
  });
  railWrap.appendChild(cnt); railWrap.appendChild(rail);
  col.appendChild(railWrap);

  /* --------------------------------------------------------------- logic */
  var cur=0, touched=false;
  function go(i){
    cur=(i%frames.length+frames.length)%frames.length;
    imgs.forEach(function(im,x){ im.classList.toggle('on', x===cur); });
    Array.prototype.forEach.call(dots.children,function(d,x){ d.classList.toggle('on', x===cur); });
    Array.prototype.forEach.call(rail.children,function(b,x){ b.classList.toggle('on', x===cur); });
    if(pills) Array.prototype.forEach.call(pills.children,function(b,x){ b.classList.toggle('on', x===cur); });
  }
  function touch(){ if(!touched){touched=true; wrap.classList.add('touched');} }

  /* drag / swipe to spin */
  var down=false, lastX=0, acc=0;
  var STEP=44;                                   // px of drag per frame
  wrap.addEventListener('pointerdown',function(e){
    down=true; lastX=e.clientX; acc=0; touch();
    wrap.classList.add('dragging');
    if(wrap.setPointerCapture) try{wrap.setPointerCapture(e.pointerId);}catch(x){}
  });
  wrap.addEventListener('pointermove',function(e){
    if(!down) return;
    var dx=e.clientX-lastX; lastX=e.clientX; acc+=dx;
    while(acc>STEP){ acc-=STEP; go(cur+1); }
    while(acc<-STEP){ acc+=STEP; go(cur-1); }
  });
  function up(){ if(down){down=false; wrap.classList.remove('dragging');} }
  addEventListener('pointerup',up); addEventListener('pointercancel',up);

  /* a clean tap (no drag, no frame change) opens the zoom view */
  var downX=0, downFrame=0;
  wrap.addEventListener('pointerdown',function(e){ downX=e.clientX; downFrame=cur; });
  wrap.addEventListener('click',function(e){
    if(Math.abs(e.clientX-downX)>10) return;     // that was a drag, not a tap
    if(cur!==downFrame) return;                  // the drag already turned the product
    zoom();
  });

  /* keyboard */
  stage.tabIndex=0;
  stage.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'){touch();go(cur+1);}
    else if(e.key==='ArrowLeft'){touch();go(cur-1);}
    else if(e.key==='Enter'||e.key===' '){e.preventDefault();zoom();}
  });

  /* zoom lightbox */
  function zoom(){
    var ov=document.createElement('div'); ov.className='pg-zoom';
    ov.innerHTML='<img src="'+frames[cur].src+'" alt=""><button class="x" aria-label="Close">&#10005;</button>'
               + '<div class="cap">'+frames[cur].name+'</div>';
    document.body.appendChild(ov);
    requestAnimationFrame(function(){ov.classList.add('show');});
    function close(){ ov.classList.remove('show'); setTimeout(function(){ov.remove();},350); }
    ov.querySelector('.x').onclick=close;
    ov.addEventListener('click',function(e){ if(e.target===ov) close(); });
    document.addEventListener('keydown',function esc(e){ if(e.key==='Escape'){close();document.removeEventListener('keydown',esc);} });
  }

  /* one-time hint spin when it scrolls into view */
  if(window.IntersectionObserver){
    var io=new IntersectionObserver(function(es,ob){
      es.forEach(function(e){
        if(!e.isIntersecting) return;
        ob.disconnect();
        setTimeout(function(){
          if(touched) return;
          var n=0, t=setInterval(function(){
            if(touched){clearInterval(t);return;}
            go(cur+1); n++;
            if(n>=frames.length){ clearInterval(t); go(0); }
          },260);
        },700);
      });
    },{threshold:.4});
    io.observe(stage);
  }
})();
