/* Progressive 3D enhancements for the existing FOTILE F20 page. */
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine)');
  const hero = $('#fhero');
  let pointerX = 0, pointerY = 0, rotationValue = 0;

  // Photo, glass, spec plates and chassis occupy separate planes.
  if (fine.matches) {
    let pending = false;
    hero.addEventListener('pointermove', e => {
      if (reduced.matches) return;
      const r = hero.getBoundingClientRect();
      pointerX = (e.clientX - r.left) / r.width - .5;
      pointerY = (e.clientY - r.top) / r.height - .5;
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        $('#heroTilt').style.transform = `rotateY(${-9 + pointerX * 15}deg) rotateX(${3 - pointerY * 10}deg) translateY(${pointerY * -9}px)`;
        pending = false;
      });
    });
    hero.addEventListener('pointerleave', () => { pointerX = pointerY = 0; $('#heroTilt').style.transform = ''; });
    $$('.fstat,.tcard,.acpt,.fimg-frame').forEach(card => {
      let frame = 0;
      card.addEventListener('pointermove', e => {
        if (reduced.matches) return;
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => { card.style.transform = `perspective(1100px) rotateX(${-y * 7}deg) rotateY(${x * 9}deg) translateY(-5px)`; });
      });
      card.addEventListener('pointerleave', () => { cancelAnimationFrame(frame); card.style.transform = ''; });
    });
  }

  const worlds = $('#worlds');
  $$('.w-tag button').forEach((button, index) => button.addEventListener('click', () => {
    const top = worlds.getBoundingClientRect().top + scrollY;
    const span = worlds.offsetHeight - innerHeight;
    window.scrollTo({ top: top + span * (index ? .87 : .13), behavior: reduced.matches ? 'instant' : 'smooth' });
  }));
  const vault = $('.vault');
  let scrollFrame = 0;
  function scrollEffects() {
    scrollFrame = 0;
    if (reduced.matches) return;
    const scene = worlds.getBoundingClientRect();
    if (scene.top < innerHeight && scene.bottom > 0) {
      const p = Math.max(0, Math.min(1, -scene.top / (scene.height - innerHeight)));
      worlds.style.setProperty('--scene-scale', String(1.1 - Math.sin(p * Math.PI) * .075));
    }
    const r = vault.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0 && innerWidth > 900) {
      const p = Math.max(0, Math.min(1, (innerHeight - r.top) / (innerHeight * .8)));
      $$('.vcard', vault).forEach((card,i) => { card.style.setProperty('--fan-angle', `${(i - 1.5) * (1-p) * 13}deg`); card.style.setProperty('--fan-y', `${Math.abs(i-1.5) * (1-p)*35}px`); });
    }
    const band = $('.prodband'), br = band.getBoundingClientRect();
    if (br.top < innerHeight && br.bottom > 0) band.style.setProperty('--produce-tilt', `${Math.max(0,(br.top/innerHeight)*9-2)}deg`);
  }
  addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(scrollEffects); }, { passive:true });
  scrollEffects();

  // Shared renderer scheduler: no animation work for offscreen canvases or hidden tabs.
  const scenes = [];
  function canvasScene(canvas, render) {
    const context = canvas.getContext('2d');
    if (!context) return;
    const scene = { canvas, context, render, visible:false, width:0, height:0 };
    scenes.push(scene);
    new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 1.5);
      scene.width = rect.width; scene.height = rect.height; canvas.width = Math.round(rect.width*dpr); canvas.height = Math.round(rect.height*dpr); context.setTransform(dpr,0,0,dpr,0,0);
      scene.render(context, scene.width, scene.height, performance.now()/1000, 0);
    }).observe(canvas);
    new IntersectionObserver(entries => { scene.visible = entries[0].isIntersecting; manageLoop(); }).observe(canvas);
  }
  const stars = Array.from({length:65},(_,i)=>({x:Math.random(),y:Math.random(),z:Math.random(),r:.4+Math.random()*1.1,s:.006+Math.random()*.009}));
  canvasScene($('#embers'), (ctx,w,h,t,dt) => {
    ctx.clearRect(0,0,w,h);
    stars.forEach(p => { p.y = (p.y - dt * p.s + 1) % 1; const depth=.25+p.z*.75; const x=p.x*w + pointerX*depth*25,y=p.y*h+pointerY*depth*15; ctx.beginPath();ctx.arc(x,y,p.r*depth,0,Math.PI*2);ctx.fillStyle=`rgba(255,61,87,${depth*.38})`;ctx.fill(); });
    const centerX=w*.76,centerY=h*.52;
    ctx.save();ctx.translate(centerX,centerY);ctx.rotate(-.45);ctx.scale(1,.32);ctx.beginPath();ctx.ellipse(0,0,w*.27,w*.27,0,Math.PI*(t*.025%2),Math.PI*(t*.025%2)+.3);ctx.strokeStyle='rgba(255,61,87,.25)';ctx.lineWidth=1;ctx.stroke();ctx.restore();
  });
  const chamber = $('#chCanvas'), nitrogen = $('#px-nitrogen');
  const molecules = Array.from({length:96},(_,i)=>{const z=1-2*(i+.5)/96,theta=i*Math.PI*(3-Math.sqrt(5)),radius=Math.sqrt(1-z*z);return{x:radius*Math.cos(theta),y:z,z:radius*Math.sin(theta),size:1.6+(i%4)*.5,index:i};});
  let concentration=85, chamberPointer={x:0,y:0};
  $('#chbox').addEventListener('pointermove',e=>{const r=chamber.getBoundingClientRect();chamberPointer={x:(e.clientX-r.left)/r.width-.5,y:(e.clientY-r.top)/r.height-.5};});
  $('#chbox').addEventListener('pointerleave',()=>{chamberPointer={x:0,y:0};});
  function drawChamber(ctx,w,h,t) {
    ctx.clearRect(0,0,w,h);
    const cx=w*.54,cy=h*.55,radius=Math.min(w,h)*.34,angle=reduced.matches?.55:t*.1+chamberPointer.x*.4;
    const ca=Math.cos(angle),sa=Math.sin(angle),tilt=.2+chamberPointer.y*.2,ct=Math.cos(tilt),st=Math.sin(tilt);
    function project(x,y,z) {const rx=x*ca+z*sa,rz=-x*sa+z*ca,ry=y*ct-rz*st,zz=y*st+rz*ct,scale=3/(3-zz*.5);return{x:cx+rx*radius*scale,y:cy+ry*radius*scale,z:zz,scale};}
    for(let ring=0;ring<3;ring++) {
      ctx.beginPath();for(let i=0;i<=120;i++){const a=i/120*Math.PI*2,pt=ring===0?project(Math.cos(a)*1.13,Math.sin(a)*1.13,0):ring===1?project(0,Math.cos(a)*1.13,Math.sin(a)*1.13):project(Math.cos(a)*1.13,0,Math.sin(a)*1.13);if(i===0)ctx.moveTo(pt.x,pt.y);else ctx.lineTo(pt.x,pt.y);}ctx.strokeStyle=ring===0?'rgba(224,30,55,.23)':'rgba(130,163,207,.14)';ctx.lineWidth=1;ctx.stroke();
    }
    const projected=molecules.map(p=>({...p,...project(p.x,p.y,p.z)})).sort((a,b)=>a.z-b.z);
    projected.forEach((p,i)=>{
      const n=p.index<Math.round(concentration/100*molecules.length),alpha=.3+(p.z+1)*.3;
      if(i%3===0&&i<projected.length-1){const q=projected[i+1];if(Math.hypot(q.x-p.x,q.y-p.y)<70){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle='rgba(119,160,214,.12)';ctx.stroke();}}
      ctx.fillStyle=n?`rgba(124,181,244,${alpha})`:`rgba(255,61,87,${alpha})`;ctx.beginPath();ctx.arc(p.x,p.y,p.size*p.scale,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(p.x+p.size*p.scale*2.5,p.y+p.size*.7,p.size*p.scale*.8,0,Math.PI*2);ctx.fill();
    });
  }
  canvasScene(chamber,drawChamber);
  nitrogen.addEventListener('input',()=>{
    concentration=Number(nitrogen.value);$('#chN2').textContent=concentration;
    $('#px-nitrogen-state').textContent=concentration===85?'F20 chamber · 85%':concentration===78?'Ordinary air · 78%':`Enriching · ${concentration}%`;
    nitrogen.setAttribute('aria-valuetext',`${concentration}% nitrogen, illustrative atmosphere`);
    if(reduced.matches)scenes.filter(s=>s.canvas===chamber).forEach(s=>s.render(s.context,s.width,s.height,0,0));
  });
  $('#chN2').textContent='85';
  let raf=0,last=0;
  function tick(time){raf=0;if(document.hidden||reduced.matches)return;const dt=last?Math.min((time-last)/1000,.05):0;last=time;scenes.filter(s=>s.visible).forEach(s=>s.render(s.context,s.width,s.height,time/1000,dt));if(scenes.some(s=>s.visible))raf=requestAnimationFrame(tick);}
  function manageLoop(){cancelAnimationFrame(raf);raf=0;last=0;if(!document.hidden&&!reduced.matches&&scenes.some(s=>s.visible))raf=requestAnimationFrame(tick);else scenes.filter(s=>s.visible).forEach(s=>s.render(s.context,s.width,s.height,0,0));}
  document.addEventListener('visibilitychange',()=>{manageLoop();});
  reduced.addEventListener('change',()=>{manageLoop();$('#heroTilt').style.transform='';});

  // Make the existing comparator announce its current position to keyboard users.
  const comparison=$('#thawCmp');comparison.setAttribute('role','slider');comparison.setAttribute('aria-label','Before and after defrosting comparison');comparison.setAttribute('aria-valuemin','2');comparison.setAttribute('aria-valuemax','98');
  new MutationObserver(()=>{comparison.setAttribute('aria-valuenow',String(Math.round(parseFloat(comparison.style.getPropertyValue('--x'))||52)));}).observe(comparison,{attributes:true,attributeFilter:['style']});
  comparison.setAttribute('aria-valuenow','52');

  // Preserve the shared menu while making its existing state keyboard-accessible.
  function bindSharedMenu(){
  const menuButton=$('.navtoggle'),mobileMenu=$('.mobmenu');
  if(menuButton&&mobileMenu&&!menuButton.dataset.pxAccessible){
    menuButton.dataset.pxAccessible='true';
    const syncMenu=()=>{const open=mobileMenu.classList.contains('open');menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close menu':'Open menu');mobileMenu.inert=!open;};
    new MutationObserver(syncMenu).observe(mobileMenu,{attributes:true,attributeFilter:['class']});syncMenu();
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mobileMenu.classList.contains('open')){menuButton.click();menuButton.focus();}});
  }
  }
  bindSharedMenu();
  document.addEventListener('DOMContentLoaded',bindSharedMenu,{once:true});
})();
