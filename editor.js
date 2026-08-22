/* =====================================================================
   FOTILE LIVE EDITOR — editor.js  (refined)
   Open any page with ?edit  →  click text to retype, click images to
   replace, then Save. Works on the clean-URL site (folder/index.html).
   Nothing touches a server; edits live in the page until you export.
   ===================================================================== */
(function(){
  const params=new URLSearchParams(location.search);
  if(!params.has('edit')) return;

  const CSS=`
    :root{--fe-red:#e01e37}
    .fe-bar{position:fixed;top:0;left:0;right:0;z-index:2147483000;height:60px;
      display:flex;align-items:center;gap:16px;padding:0 20px;
      background:rgba(12,12,16,.86);backdrop-filter:blur(20px) saturate(140%);-webkit-backdrop-filter:blur(20px) saturate(140%);
      border-bottom:1px solid rgba(255,255,255,.1);font-family:Manrope,system-ui,sans-serif;color:#fff;
      box-shadow:0 8px 30px rgba(0,0,0,.35)}
    .fe-brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:14px;letter-spacing:.3px}
    .fe-brand .fe-dot{width:8px;height:8px;border-radius:50%;background:var(--fe-red);box-shadow:0 0 0 4px rgba(224,30,55,.18);animation:fePulse 2s ease-in-out infinite}
    @keyframes fePulse{0%,100%{box-shadow:0 0 0 4px rgba(224,30,55,.18)}50%{box-shadow:0 0 0 7px rgba(224,30,55,.05)}}
    .fe-brand small{font-weight:500;color:#9a9ca6;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;margin-left:2px}
    .fe-legend{display:flex;gap:16px;font-size:12px;color:#a7a9b2;font-weight:500}
    .fe-legend b{color:#fff;font-weight:600}
    .fe-legend i{font-style:normal;color:var(--fe-red)}
    .fe-sp{flex:1}
    .fe-status{font-size:12px;color:#7d7f89;font-weight:500;display:flex;align-items:center;gap:7px;transition:.3s}
    .fe-status .d{width:7px;height:7px;border-radius:50%;background:#3ec98a;transition:.3s}
    .fe-status.dirty{color:#f6c445}.fe-status.dirty .d{background:#f6c445;box-shadow:0 0 10px #f6c445}
    .fe-btn{font-family:inherit;font-weight:600;font-size:13px;border:none;border-radius:9px;padding:11px 18px;cursor:pointer;
      transition:transform .2s cubic-bezier(.16,1,.3,1),background .25s,border-color .25s,box-shadow .25s;display:inline-flex;align-items:center;gap:7px}
    .fe-btn:hover{transform:translateY(-1px)}
    .fe-ghost{background:rgba(255,255,255,.06);color:#fff;border:1px solid rgba(255,255,255,.14)}.fe-ghost:hover{border-color:rgba(255,255,255,.35)}
    .fe-save{background:linear-gradient(135deg,#e01e37,#ff4157);color:#fff;box-shadow:0 6px 18px rgba(224,30,55,.35)}
    .fe-save:hover{box-shadow:0 10px 26px rgba(224,30,55,.5)}
    body{padding-top:60px !important}
    [data-fe-text]{transition:box-shadow .15s,background .15s;cursor:text;border-radius:4px}
    [data-fe-text]:hover{box-shadow:0 0 0 1.5px rgba(224,30,55,.45);background:rgba(224,30,55,.04)}
    [data-fe-text][contenteditable="true"]{box-shadow:0 0 0 2px var(--fe-red) !important;background:rgba(224,30,55,.08);outline:none}
    [data-fe-img]{position:relative;cursor:pointer !important;transition:box-shadow .2s}
    [data-fe-img]:hover{box-shadow:0 0 0 2px rgba(224,30,55,.7)}
    .fe-imgtag{position:absolute;top:10px;left:10px;z-index:60;display:flex;align-items:center;gap:6px;
      background:rgba(12,12,16,.82);backdrop-filter:blur(6px);color:#fff;font-family:Manrope,sans-serif;font-weight:600;font-size:11.5px;
      padding:7px 12px;border-radius:50px;border:1px solid rgba(255,255,255,.18);opacity:0;transform:translateY(-4px);transition:.2s;pointer-events:none}
    [data-fe-img]:hover .fe-imgtag{opacity:1;transform:none}
    .fe-toast{position:fixed;bottom:26px;left:50%;transform:translateX(-50%) translateY(10px);z-index:2147483000;
      background:rgba(12,12,16,.95);backdrop-filter:blur(10px);border:1px solid rgba(62,201,138,.5);
      color:#eafff4;font-family:Manrope,sans-serif;font-weight:500;font-size:13.5px;padding:14px 22px;border-radius:12px;
      opacity:0;transition:.35s cubic-bezier(.16,1,.3,1);box-shadow:0 16px 40px rgba(0,0,0,.5);max-width:420px;line-height:1.5}
    .fe-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
    .fe-toast b{color:#3ec98a}
  `;
  const style=document.createElement('style');style.id='fe-style';style.textContent=CSS;document.head.appendChild(style);

  let dirty=false;
  function markDirty(){ if(dirty) return; dirty=true; const s=document.getElementById('feStatus');
    if(s){s.classList.add('dirty');s.querySelector('span:last-child').textContent='Unsaved changes';} }

  const bar=document.createElement('div');bar.className='fe-bar';
  bar.innerHTML=`
    <div class="fe-brand"><span class="fe-dot"></span>FOTILE<small>Live Editor</small></div>
    <div class="fe-legend"><span><i>&#9998;</i> Click <b>text</b> to retype</span><span><i>&#9714;</i> Click an <b>image</b> to replace</span></div>
    <div class="fe-sp"></div>
    <div class="fe-status" id="feStatus"><span class="d"></span><span>All changes shown</span></div>
    <button class="fe-btn fe-ghost" id="feExit">Preview</button>
    <button class="fe-btn fe-save" id="feSave">Save Page</button>`;
  document.body.appendChild(bar);

  function toast(msg,ms){
    const t=document.createElement('div');t.className='fe-toast';t.innerHTML=msg;document.body.appendChild(t);
    requestAnimationFrame(()=>t.classList.add('show'));
    setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),450);},ms||3000);
  }

  /* ---- TEXT editable ---- */
  const TEXT_TAGS=['H1','H2','H3','H4','H5','H6','P','SPAN','B','LI','A','SMALL','DIV','BUTTON'];
  document.querySelectorAll(TEXT_TAGS.join(',')).forEach(el=>{
    if(el.closest('.fe-bar'))return;
    const hasBlockChild=[...el.children].some(c=>getComputedStyle(c).display!=='inline');
    if(hasBlockChild)return;
    if(!el.textContent.trim())return;
    if(el.querySelector('img,svg,iframe,canvas'))return;
    el.setAttribute('data-fe-text','');el.setAttribute('contenteditable','false');
  });
  document.addEventListener('click',e=>{
    const t=e.target.closest('[data-fe-text]');
    if(t&&t.getAttribute('contenteditable')!=='true'){ t.setAttribute('contenteditable','true'); t.focus(); }
  });
  document.addEventListener('input',e=>{ if(e.target.hasAttribute&&e.target.hasAttribute('data-fe-text'))markDirty(); },true);
  document.addEventListener('blur',e=>{
    if(e.target.hasAttribute&&e.target.hasAttribute('data-fe-text'))e.target.setAttribute('contenteditable','false');
  },true);

  /* ---- IMAGE editable ---- */
  function tagImg(el,label){
    const t=document.createElement('span');t.className='fe-imgtag';t.textContent='◲ '+(label||'Replace image');
    if(el.tagName==='IMG'){ if(el.parentElement){ if(getComputedStyle(el.parentElement).position==='static')el.parentElement.style.position='relative'; el.parentElement.appendChild(t);} }
    else{ if(getComputedStyle(el).position==='static')el.style.position='relative'; el.appendChild(t); }
  }
  document.querySelectorAll('img').forEach(img=>{
    if(img.closest('.fe-bar'))return;
    img.setAttribute('data-fe-img','');
    img.addEventListener('click',()=>pickImage(f=>{img.src=f;markDirty();}));
    tagImg(img);
  });
  document.querySelectorAll('*').forEach(el=>{
    if(el.closest('.fe-bar'))return;
    const bg=getComputedStyle(el).backgroundImage;
    if(bg&&bg!=='none'&&bg.includes('url(')&&!el.hasAttribute('data-fe-img')){
      if(el.offsetWidth<80||el.offsetHeight<50)return;
      el.setAttribute('data-fe-img','');
      el.addEventListener('click',ev=>{ if(ev.target!==el)return; pickImage(f=>{el.style.backgroundImage=`url('${f}')`;markDirty();}); });
      tagImg(el,'Replace background');
    }
  });
  function pickImage(cb){
    const inp=document.createElement('input');inp.type='file';inp.accept='image/*';
    inp.onchange=()=>{const file=inp.files[0];if(!file)return;
      const r=new FileReader();r.onload=()=>{cb(r.result);toast('Image swapped — hit <b>Save Page</b> to keep it');};r.readAsDataURL(file);};
    inp.click();
  }

  /* ---- PREVIEW / SAVE ---- */
  document.getElementById('feExit').onclick=()=>{
    if(dirty&&!confirm('Leave edit mode? Unsaved changes will be lost.'))return;
    location.href=location.pathname;
  };
  document.getElementById('feSave').onclick=()=>{
    const clone=document.documentElement.cloneNode(true);
    clone.querySelectorAll('[data-fe-text]').forEach(el=>{el.removeAttribute('data-fe-text');el.removeAttribute('contenteditable');});
    clone.querySelectorAll('[data-fe-img]').forEach(el=>el.removeAttribute('data-fe-img'));
    clone.querySelectorAll('.fe-imgtag,.fe-toast').forEach(t=>t.remove());
    const b=clone.querySelector('.fe-bar');if(b)b.remove();
    const st=clone.querySelector('#fe-style');if(st)st.remove();
    clone.querySelectorAll('script').forEach(s=>{if(s.src&&s.src.includes('editor.js'))s.remove();});
    const html='<!DOCTYPE html>\n'+clone.outerHTML;
    const blob=new Blob([html],{type:'text/html'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='index.html';a.click();
    const parts=location.pathname.split('/').filter(Boolean).filter(p=>!p.endsWith('.html'));
    const folder = parts.length? '/'+parts.join('/')+'/' : '/ (site root)';
    dirty=false;const s=document.getElementById('feStatus');if(s){s.classList.remove('dirty');s.querySelector('span:last-child').textContent='Saved';}
    toast('Saved as <b>index.html</b> — drop it into your site folder at <b>'+folder+'</b> to publish.',6000);
  };

  addEventListener('beforeunload',e=>{ if(dirty){e.preventDefault();e.returnValue='';} });
  toast('Edit mode on — click any <b>text</b> or <b>image</b> to change it');
})();
