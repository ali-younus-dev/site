/* =====================================================================
   FOTILE CART ENGINE — cart.js
   ---------------------------------------------------------------------
   A tiny shared cart used across the whole site. Include on every page:
       <script src="cart.js"></script>
   Then anywhere:
       FotileCart.add({id,name,price,img,cat})   // add / +1
       FotileCart.count()                         // number of items
   The cart icon (🛒 with a count bubble) updates automatically.

   NOTE: this is the front-end cart. It keeps items in memory for the
   session. On the real Next.js/WordPress build this connects to
   WooCommerce so carts persist and checkout takes real payment.
   (Browser storage is intentionally avoided here for compatibility.)
   ===================================================================== */
window.FotileCart=(function(){
  let items=[];               // {id,name,price,img,cat,qty}
  const listeners=[];

  function save(){ /* real build: POST to /api/cart */ notify(); }
  function notify(){ listeners.forEach(f=>f(items)); updateBadges(); }

  function add(p){
    const ex=items.find(i=>i.id===p.id);
    if(ex){ ex.qty++; } else { items.push({...p,qty:1}); }
    save(); toast(`${p.name} added to cart`);
  }
  function remove(id){ items=items.filter(i=>i.id!==id); save(); }
  function setQty(id,q){ const it=items.find(i=>i.id===id); if(it){ it.qty=Math.max(1,q); } save(); }
  function count(){ return items.reduce((n,i)=>n+i.qty,0); }
  function subtotal(){ return items.reduce((s,i)=>s+(i.price||0)*i.qty,0); }
  function all(){ return items; }
  function onChange(fn){ listeners.push(fn); fn(items); }

  /* ---- cart badge on 🛒 icons ---- */
  function updateBadges(){
    document.querySelectorAll('[data-cart-count]').forEach(el=>{
      const c=count(); el.textContent=c; el.style.display=c?'flex':'none';
    });
  }

  /* ---- lightweight toast ---- */
  let tEl;
  function toast(msg){
    if(!tEl){
      tEl=document.createElement('div');
      tEl.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);z-index:99999;background:#111;border:1px solid rgba(255,255,255,.14);color:#fff;font-family:Manrope,system-ui,sans-serif;font-weight:600;font-size:13.5px;padding:13px 20px;border-radius:12px;opacity:0;transition:.35s cubic-bezier(.16,1,.3,1);box-shadow:0 14px 34px rgba(0,0,0,.45);display:flex;align-items:center;gap:10px';
      document.body.appendChild(tEl);
    }
    tEl.innerHTML='<span style="color:#3ec98a">✓</span> '+msg+' <a href="cart.html" style="color:#e6a64d;margin-left:6px;text-decoration:underline">View cart</a>';
    requestAnimationFrame(()=>{tEl.style.opacity='1';tEl.style.transform='translateX(-50%) translateY(0)';});
    clearTimeout(tEl._t);
    tEl._t=setTimeout(()=>{tEl.style.opacity='0';tEl.style.transform='translateX(-50%) translateY(20px)';},3200);
  }

  /* ---- auto-wire any element with data-add-to-cart ---- */
  function wireButtons(){
    document.querySelectorAll('[data-add]').forEach(btn=>{
      if(btn._wired)return; btn._wired=true;
      btn.addEventListener('click',e=>{
        e.preventDefault();
        add({
          id:btn.dataset.id||btn.dataset.name,
          name:btn.dataset.name,
          price:parseInt(btn.dataset.price||'0',10),
          img:btn.dataset.img||'',
          cat:btn.dataset.cat||''
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded',()=>{updateBadges();wireButtons();});
  // re-wire when dynamic content is added (product grids etc.)
  window.FotileCartWire=wireButtons;

  return {add,remove,setQty,count,subtotal,all,onChange};
})();
