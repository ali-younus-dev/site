/* =====================================================================
   FOTILE QUOTE BASKET — cart.js
   ---------------------------------------------------------------------
   One shared basket for the whole site. Include on every page:
       <script src="products-data.js"></script>
       <script src="cart.js"></script>

   WHAT IT DOES BY ITSELF (no page editing required):
     • Persists the basket in the browser, so it survives navigation,
       refreshes and new tabs.
     • Puts an "Add to Quote" button on EVERY product card (shop grid,
       category pages, search results, related products) and an
       "Add to Quote Basket" button on every product detail page.
       New products added in the dashboard get one automatically —
       nothing has to be edited by hand, ever.
     • Keeps the 🛒 count bubble in the navbar in sync.
     • Opens a slide-in basket drawer when something is added.

   PRICES: a product with an empty `price` in products-data.js shows
   "Price on request". Put a price in the dashboard and it starts
   showing money and adding to the subtotal automatically.

   PUBLIC API (window.FotileBasket, also aliased as window.FotileCart):
       add(item, qty)   addSlug(slug, qty)   remove(slug)
       setQty(slug, q)  clear()   all()   count()   subtotal()
       onChange(fn)     open()    close()
   ===================================================================== */
(function () {
  'use strict';

  var KEY  = 'fotile_basket_v1';
  var WA   = '924211131517';                 /* Fotile Pakistan WhatsApp  */
  var BAD  = '920000000000';                 /* placeholder to repair     */

  /* ---------------------------------------------------------------- */
  /*  storage                                                         */
  /* ---------------------------------------------------------------- */
  var LS = (function () {
    try { localStorage.setItem('__fc', '1'); localStorage.removeItem('__fc'); return true; }
    catch (e) { return false; }
  })();
  var mem = [];

  function read() {
    if (!LS) return mem;
    try { var r = localStorage.getItem(KEY); return r ? (JSON.parse(r) || []) : []; }
    catch (e) { return []; }
  }
  function write(a) {
    mem = a;
    if (!LS) return;
    try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {}
  }

  var items = read();

  /* ---------------------------------------------------------------- */
  /*  helpers                                                         */
  /* ---------------------------------------------------------------- */
  function amountOf(price) {
    var n = parseInt(String(price == null ? '' : price).replace(/[^\d]/g, ''), 10);
    return isNaN(n) ? 0 : n;
  }
  function priceLabel(price) {
    var raw = String(price == null ? '' : price).trim();
    if (!raw) return '';
    return /\d/.test(raw) && !/[a-z]/i.test(raw) ? 'Rs ' + amountOf(raw).toLocaleString() : raw;
  }
  function money(n) { return 'Rs ' + (n || 0).toLocaleString(); }

  /* Image paths in products-data.js are written relative to the SITE ROOT
     ("assets/products/x.png"). Every page declares how deep it is in
     window.__PBASE ("", "../", "../../"), so a basket shared across pages
     must store the bare path and resolve it at render time. */
  function ext(u) { return /^(https?:)?\/\//.test(u) || /^data:/.test(u); }
  function bare(u) {
    if (!u) return '';
    if (ext(u)) return u;
    return String(u).replace(/^\/+/, '').replace(/^(\.\/)+/, '').replace(/^(\.\.\/)+/, '');
  }
  function src(u) {
    if (!u) return '';
    if (ext(u)) return u;
    return (window.__PBASE || '') + bare(u);
  }
  function slugFromHref(h) {
    if (!h) return '';
    var m = String(h).match(/\/shop\/([a-z0-9][a-z0-9\-]*)\/?(?:[?#]|$)/i);
    return m ? m[1] : '';
  }
  function findProduct(slug) {
    var P = window.FOTILE_PRODUCTS || [];
    for (var i = 0; i < P.length; i++) if (P[i].slug === slug) return P[i];
    return null;
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  var ON_CART_PAGE = /\/cart\/?$|cart\.html$/i.test(location.pathname);

  /* ---------------------------------------------------------------- */
  /*  core                                                            */
  /* ---------------------------------------------------------------- */
  var listeners = [];

  function notify() {
    write(items);
    updateBadges();
    renderDrawer();
    for (var i = 0; i < listeners.length; i++) { try { listeners[i](items); } catch (e) {} }
  }

  function add(p, qty) {
    if (!p || !p.slug) return;
    qty = Math.max(1, parseInt(qty, 10) || 1);
    var ex = null;
    for (var i = 0; i < items.length; i++) if (items[i].slug === p.slug) { ex = items[i]; break; }
    if (ex) { ex.qty += qty; }
    else {
      items.push({
        slug:  p.slug,
        name:  p.name || p.slug,
        model: p.model || '',
        img:   bare(p.img || ''),
        cat:   p.cat || '',
        price: p.price || '',
        qty:   qty
      });
    }
    notify();
    open();
    return true;
  }

  function addSlug(slug, qty) {
    var p = findProduct(slug);
    if (!p) return false;
    return add(p, qty);
  }

  function remove(slug) {
    items = items.filter(function (i) { return i.slug !== slug; });
    notify();
  }
  function setQty(slug, q) {
    q = parseInt(q, 10) || 0;
    if (q < 1) return remove(slug);
    for (var i = 0; i < items.length; i++) if (items[i].slug === slug) { items[i].qty = Math.min(99, q); break; }
    notify();
  }
  function clear() { items = []; notify(); }
  function all() { return items.slice(); }
  function has(slug) { for (var i = 0; i < items.length; i++) if (items[i].slug === slug) return true; return false; }
  function count() { return items.reduce(function (n, i) { return n + i.qty; }, 0); }
  function subtotal() { return items.reduce(function (s, i) { return s + amountOf(i.price) * i.qty; }, 0); }
  function pricedCount() { return items.filter(function (i) { return amountOf(i.price) > 0; }).length; }
  function onChange(fn) { listeners.push(fn); try { fn(items); } catch (e) {} }

  /* keep tabs in sync */
  window.addEventListener('storage', function (e) {
    if (e.key !== KEY) return;
    items = read();
    updateBadges(); renderDrawer();
    for (var i = 0; i < listeners.length; i++) { try { listeners[i](items); } catch (err) {} }
  });

  /* ---------------------------------------------------------------- */
  /*  WhatsApp message for the whole basket                           */
  /* ---------------------------------------------------------------- */
  function waText(who) {
    var L = ['Hello Fotile Pakistan, I would like a quote for:', ''];
    items.forEach(function (i, n) {
      L.push((n + 1) + '. ' + i.name + (i.model ? ' (' + i.model + ')' : '') + ' x' + i.qty);
    });
    L.push('');
    if (who && who.name)  L.push('Name: ' + who.name);
    if (who && who.phone) L.push('Phone: ' + who.phone);
    if (who && who.city)  L.push('City: ' + who.city);
    if (who && who.note)  L.push('Notes: ' + who.note);
    return L.join('\n');
  }
  function waLink(who) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(waText(who)); }

  /* ---------------------------------------------------------------- */
  /*  styles                                                          */
  /* ---------------------------------------------------------------- */
  var CSS = ''
  + '.fc-add{display:inline-flex;align-items:center;justify-content:center;gap:7px;cursor:pointer;'
  + 'font-family:inherit;font-weight:600;border-radius:50px;border:1px solid rgba(230,199,140,.42);'
  + 'background:rgba(230,199,140,.10);color:var(--champ-lt,#e8d9b6);transition:.25s cubic-bezier(.16,1,.3,1);'
  + 'white-space:nowrap;line-height:1;-webkit-tap-highlight-color:transparent}'
  + '.fc-add:hover{background:rgba(230,199,140,.2);border-color:rgba(230,199,140,.78);transform:translateY(-1px)}'
  + '.fc-add.in{background:rgba(62,201,138,.14);border-color:rgba(62,201,138,.5);color:#6fe0ac}'
  /* detail-page button */
  + '.fc-add.big{padding:15px 26px;font-size:13.5px;letter-spacing:.4px;'
  + 'background:linear-gradient(135deg,#e6c78c,#c9a765);border-color:transparent;color:#17120a;'
  + 'box-shadow:0 12px 30px rgba(230,199,140,.22)}'
  + '.fc-add.big:hover{box-shadow:0 16px 38px rgba(230,199,140,.34)}'
  + '.fc-add.big.in{background:rgba(62,201,138,.16);color:#6fe0ac;border-color:rgba(62,201,138,.5);box-shadow:none}'
  /* card button */
  + '.fc-add.mini{padding:8px 13px;font-size:11.5px;letter-spacing:.2px}'
  + '.fc-cw{position:relative;display:block}'
  + '.fc-cw>.pcard{height:100%}'
  + '.fc-cw>.fc-add.mini{position:absolute;right:14px;bottom:14px;z-index:3;'
  + 'background:rgba(16,17,20,.86);backdrop-filter:blur(8px)}'
  + '.pfoot .fc-add.mini{flex:0 0 auto}'
  /* drawer */
  + '.fc-scrim{position:fixed;inset:0;z-index:99990;background:rgba(4,4,6,.62);backdrop-filter:blur(4px);'
  + 'opacity:0;pointer-events:none;transition:.4s cubic-bezier(.16,1,.3,1)}'
  + '.fc-scrim.on{opacity:1;pointer-events:auto}'
  + '.fc-draw{position:fixed;top:0;right:0;bottom:0;width:392px;max-width:88vw;z-index:99991;'
  + 'background:#0e0f12;border-left:1px solid rgba(255,255,255,.1);display:flex;flex-direction:column;'
  + 'font-family:Manrope,system-ui,-apple-system,sans-serif;color:#e8eaed;'
  + 'transform:translateX(104%);transition:.46s cubic-bezier(.16,1,.3,1);box-shadow:-30px 0 70px rgba(0,0,0,.5)}'
  + '.fc-draw.on{transform:none}'
  + '.fc-hd{display:flex;align-items:center;justify-content:space-between;padding:22px 24px;'
  + 'border-bottom:1px solid rgba(255,255,255,.08);flex:0 0 auto}'
  + '.fc-hd h3{margin:0;font-size:14px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#e8d9b6}'
  + '.fc-x{background:none;border:0;color:#9ea2a8;font-size:22px;cursor:pointer;line-height:1;padding:4px 6px}'
  + '.fc-x:hover{color:#fff}'
  + '.fc-body{flex:1 1 auto;overflow-y:auto;padding:8px 24px 16px}'
  + '.fc-li{display:grid;grid-template-columns:62px 1fr auto;gap:13px;align-items:center;'
  + 'padding:16px 0;border-bottom:1px solid rgba(255,255,255,.07)}'
  + '.fc-li .th{width:62px;height:62px;border-radius:11px;background:#16181c;display:flex;'
  + 'align-items:center;justify-content:center;overflow:hidden;border:1px solid rgba(255,255,255,.07)}'
  + '.fc-li .th img{max-width:84%;max-height:84%;object-fit:contain}'
  + '.fc-li .nm{font-size:13.5px;font-weight:600;line-height:1.35}'
  + '.fc-li .md{font-size:11.5px;color:#9ea2a8;margin-top:3px}'
  + '.fc-li .pr{font-size:12px;color:#e8d9b6;margin-top:5px;font-weight:600}'
  + '.fc-li .pr.q{color:#9ea2a8;font-weight:500}'
  + '.fc-qty{display:flex;align-items:center;gap:2px;border:1px solid rgba(255,255,255,.14);'
  + 'border-radius:50px;padding:3px;margin-top:8px;width:max-content}'
  + '.fc-qty button{width:23px;height:23px;border:0;border-radius:50%;background:none;color:#cfd3d8;'
  + 'cursor:pointer;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center}'
  + '.fc-qty button:hover{background:rgba(255,255,255,.1);color:#fff}'
  + '.fc-qty span{min-width:20px;text-align:center;font-size:12.5px;font-weight:700}'
  + '.fc-rm{background:none;border:0;color:#6b7078;cursor:pointer;font-size:16px;padding:4px;align-self:start}'
  + '.fc-rm:hover{color:#e01e37}'
  + '.fc-ft{flex:0 0 auto;padding:20px 24px 24px;border-top:1px solid rgba(255,255,255,.08);background:#0b0c0e}'
  + '.fc-sum{display:flex;justify-content:space-between;font-size:13px;color:#9ea2a8;margin-bottom:6px}'
  + '.fc-sum b{color:#fff;font-size:15px}'
  + '.fc-note{font-size:11.5px;color:#767b83;line-height:1.5;margin:8px 0 14px}'
  + '.fc-go{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:15px;'
  + 'border-radius:50px;border:0;cursor:pointer;font-family:inherit;font-size:13.5px;font-weight:700;'
  + 'letter-spacing:.4px;background:linear-gradient(135deg,#e6c78c,#c9a765);color:#17120a;text-decoration:none;'
  + 'transition:.25s}'
  + '.fc-go:hover{box-shadow:0 14px 34px rgba(230,199,140,.3);transform:translateY(-1px)}'
  + '.fc-keep{display:block;text-align:center;margin-top:12px;font-size:12px;color:#9ea2a8;'
  + 'text-decoration:none;cursor:pointer}'
  + '.fc-keep:hover{color:#e8d9b6}'
  + '.fc-empty{text-align:center;padding:64px 10px;color:#9ea2a8}'
  + '.fc-empty .ic{font-size:36px;opacity:.5;margin-bottom:14px}'
  + '.fc-empty p{font-size:13.5px;font-weight:300;margin:6px 0 20px}'
  /* toast */
  + '.fc-toast{position:fixed;left:50%;bottom:24px;z-index:99999;transform:translate(-50%,22px);'
  + 'background:#15171a;border:1px solid rgba(255,255,255,.14);color:#fff;font-family:Manrope,system-ui,sans-serif;'
  + 'font-weight:600;font-size:13px;padding:13px 19px;border-radius:12px;opacity:0;pointer-events:none;'
  + 'transition:.35s cubic-bezier(.16,1,.3,1);box-shadow:0 14px 34px rgba(0,0,0,.45);display:flex;align-items:center;gap:9px}'
  + '.fc-toast.on{opacity:1;transform:translate(-50%,0)}'
  + '@media(max-width:600px){.fc-draw{width:100%;max-width:100%}'
  + '.fc-cw>.fc-add.mini{right:10px;bottom:10px}}';

  function injectCSS() {
    if (document.getElementById('fc-css')) return;
    var s = document.createElement('style');
    s.id = 'fc-css'; s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  /* ---------------------------------------------------------------- */
  /*  badge                                                           */
  /* ---------------------------------------------------------------- */
  function updateBadges() {
    var c = count();
    var els = document.querySelectorAll('[data-cart-count]');
    for (var i = 0; i < els.length; i++) {
      els[i].textContent = c;
      els[i].style.display = c ? 'flex' : 'none';
    }
  }

  /* ---------------------------------------------------------------- */
  /*  drawer                                                          */
  /* ---------------------------------------------------------------- */
  var scrim, draw, body, foot;

  function buildDrawer() {
    if (draw || ON_CART_PAGE || !document.body) return;
    injectCSS();
    scrim = document.createElement('div');
    scrim.className = 'fc-scrim';
    scrim.addEventListener('click', close);

    draw = document.createElement('aside');
    draw.className = 'fc-draw';
    draw.setAttribute('aria-label', 'Quote basket');
    draw.innerHTML =
      '<div class="fc-hd"><h3>Quote Basket</h3>'
      + '<button class="fc-x" aria-label="Close basket">&times;</button></div>'
      + '<div class="fc-body"></div><div class="fc-ft"></div>';

    document.body.appendChild(scrim);
    document.body.appendChild(draw);
    body = draw.querySelector('.fc-body');
    foot = draw.querySelector('.fc-ft');
    draw.querySelector('.fc-x').addEventListener('click', close);

    body.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-fc]') : null;
      if (!b) return;
      var s = b.getAttribute('data-slug');
      var a = b.getAttribute('data-fc');
      if (a === 'inc') setQty(s, (findItem(s) || {}).qty + 1);
      if (a === 'dec') setQty(s, (findItem(s) || {}).qty - 1);
      if (a === 'rm')  remove(s);
    });
    renderDrawer();
  }
  function findItem(s) { for (var i = 0; i < items.length; i++) if (items[i].slug === s) return items[i]; return null; }

  function renderDrawer() {
    if (!body) return;
    if (!items.length) {
      body.innerHTML = '<div class="fc-empty"><div class="ic">&#9737;</div>'
        + '<h4 style="margin:0;font-size:15px;font-weight:600">Your basket is empty</h4>'
        + '<p>Add the products you\'re interested in and send us one enquiry.</p>'
        + '<a href="/shop/" class="fc-go" style="max-width:210px;margin:0 auto">Browse products</a></div>';
      foot.innerHTML = '';
      return;
    }
    body.innerHTML = items.map(function (i) {
      var lbl = priceLabel(i.price);
      return '<div class="fc-li">'
        + '<div class="th">' + (i.img ? '<img src="' + esc(src(i.img)) + '" alt="' + esc(i.name) + '">' : '') + '</div>'
        + '<div><div class="nm">' + esc(i.name) + '</div>'
        + (i.model ? '<div class="md">' + esc(i.model) + '</div>' : '')
        + '<div class="pr' + (lbl ? '' : ' q') + '">' + (lbl || 'Price on request') + '</div>'
        + '<div class="fc-qty"><button data-fc="dec" data-slug="' + esc(i.slug) + '" aria-label="Decrease">&minus;</button>'
        + '<span>' + i.qty + '</span>'
        + '<button data-fc="inc" data-slug="' + esc(i.slug) + '" aria-label="Increase">+</button></div></div>'
        + '<button class="fc-rm" data-fc="rm" data-slug="' + esc(i.slug) + '" aria-label="Remove">&times;</button>'
        + '</div>';
    }).join('');

    var sub = subtotal(), np = items.length - pricedCount();
    foot.innerHTML =
      '<div class="fc-sum"><span>' + count() + ' item' + (count() === 1 ? '' : 's') + '</span>'
      + (sub ? '<b>' + money(sub) + '</b>' : '<b style="font-size:13px;color:#9ea2a8">Quote</b>') + '</div>'
      + '<div class="fc-note">'
      + (np ? np + ' item' + (np === 1 ? '' : 's') + ' priced on request. ' : '')
      + 'Send the list and our team replies with pricing, availability and installation.</div>'
      + '<a class="fc-go" href="/cart/">Request a quote &rarr;</a>'
      + '<a class="fc-keep">Keep browsing</a>';
    var k = foot.querySelector('.fc-keep');
    if (k) k.addEventListener('click', close);
  }

  function open() {
    if (ON_CART_PAGE) return;
    buildDrawer();
    if (!draw) return;
    scrim.classList.add('on'); draw.classList.add('on');
    document.documentElement.style.overflow = 'hidden';
  }
  function close() {
    if (!draw) return;
    scrim.classList.remove('on'); draw.classList.remove('on');
    document.documentElement.style.overflow = '';
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  /* ---------------------------------------------------------------- */
  /*  toast                                                           */
  /* ---------------------------------------------------------------- */
  var tEl;
  function toast(msg) {
    injectCSS();
    if (!tEl) { tEl = document.createElement('div'); tEl.className = 'fc-toast'; document.body.appendChild(tEl); }
    tEl.innerHTML = '<span style="color:#3ec98a">&#10003;</span> ' + esc(msg);
    requestAnimationFrame(function () { tEl.classList.add('on'); });
    clearTimeout(tEl._t);
    tEl._t = setTimeout(function () { tEl.classList.remove('on'); }, 2600);
  }

  /* ---------------------------------------------------------------- */
  /*  auto-inject the buttons                                         */
  /* ---------------------------------------------------------------- */
  function label(slug, mini) {
    if (has(slug)) return mini ? '&#10003; In basket' : '&#10003; In quote basket';
    return mini ? '+ Quote' : '&#43;&nbsp; Add to Quote Basket';
  }
  function mkBtn(slug, mini) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'fc-add ' + (mini ? 'mini' : 'big') + (has(slug) ? ' in' : '');
    b.setAttribute('data-fc-add', slug);
    b.innerHTML = label(slug, mini);
    b.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      if (has(slug)) { open(); return; }
      if (!addSlug(slug)) {
        /* catalogue not on this page — fall back to what's in the DOM */
        var card = b.closest ? (b.closest('.fc-cw') || b.closest('.pcard') || b.closest('.pdp-grid')) : null;
        var img  = card ? card.querySelector('img') : null;
        var nm   = card ? card.querySelector('.pname, h1') : null;
        add({ slug: slug, name: nm ? nm.textContent.trim() : slug, img: img ? img.getAttribute('src') : '' });
      }
    });
    return b;
  }
  function syncButtons() {
    var bs = document.querySelectorAll('[data-fc-add]');
    for (var i = 0; i < bs.length; i++) {
      var s = bs[i].getAttribute('data-fc-add');
      var mini = bs[i].classList.contains('mini');
      bs[i].innerHTML = label(s, mini);
      bs[i].classList.toggle('in', has(s));
    }
  }
  listeners.push(syncButtons);

  function injectPDP() {
    var cta = document.querySelector('.pdp-cta');
    if (!cta || cta.getAttribute('data-fc')) return;
    var slug = slugFromHref(location.pathname);
    if (!slug) return;
    cta.setAttribute('data-fc', '1');
    cta.insertBefore(mkBtn(slug, false), cta.firstChild);
  }

  function injectCards() {
    var cards = document.querySelectorAll('.pcard');
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      if (c.getAttribute('data-fc')) continue;
      var slug = slugFromHref(c.getAttribute('href') || '');
      if (!slug) {
        var a = c.querySelector('a[href*="/shop/"]');
        slug = a ? slugFromHref(a.getAttribute('href')) : '';
      }
      if (!slug) continue;
      c.setAttribute('data-fc', '1');
      var btn = mkBtn(slug, true);
      if (c.tagName === 'A') {
        /* the whole card is a link — sit the button on top of it */
        if (c.parentNode && !(c.parentNode.className || '').match(/fc-cw/)) {
          var w = document.createElement('div');
          w.className = 'fc-cw';
          c.parentNode.insertBefore(w, c);
          w.appendChild(c);
          w.appendChild(btn);
        }
      } else {
        var foot2 = c.querySelector('.pfoot') || c.querySelector('.pbody') || c;
        foot2.appendChild(btn);
      }
    }
    /* tidy wrappers whose card was removed (discontinued products) */
    var ws = document.querySelectorAll('.fc-cw');
    for (var j = 0; j < ws.length; j++) if (!ws[j].querySelector('.pcard')) ws[j].parentNode.removeChild(ws[j]);
  }

  /* legacy data-add buttons keep working */
  function wireLegacy() {
    var bs = document.querySelectorAll('[data-add]');
    for (var i = 0; i < bs.length; i++) {
      (function (btn) {
        if (btn._wired) return; btn._wired = true;
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          add({ slug: btn.dataset.id || btn.dataset.slug || btn.dataset.name, name: btn.dataset.name,
                price: btn.dataset.price || '', img: btn.dataset.img || '', cat: btn.dataset.cat || '' });
        });
      })(bs[i]);
    }
  }

  /* cart icon in the navbar opens the drawer instead of a page hop */
  function wireIcons() {
    var as = document.querySelectorAll('a[href="/cart/"], a[href$="cart.html"], a[href="../cart/"]');
    for (var i = 0; i < as.length; i++) {
      var a = as[i];
      if (a._fc || a.classList.contains('fc-go')) continue;
      if (!a.querySelector('[data-cart-count]')) continue;   /* only the 🛒 icon */
      a._fc = true;
      if (ON_CART_PAGE) continue;
      a.addEventListener('click', function (e) { e.preventDefault(); open(); });
    }
  }

  /* repair the placeholder WhatsApp number left on product pages */
  function fixWA() {
    var as = document.querySelectorAll('a[href*="wa.me/' + BAD + '"]');
    for (var i = 0; i < as.length; i++) {
      as[i].setAttribute('href', as[i].getAttribute('href').replace(BAD, WA));
    }
  }

  function scan() {
    injectCSS(); injectPDP(); injectCards(); wireLegacy(); wireIcons(); fixWA(); updateBadges();
  }

  function boot() {
    buildDrawer();
    scan();
    if (window.MutationObserver) {
      var t = null, mo = new MutationObserver(function () {
        clearTimeout(t); t = setTimeout(scan, 80);
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  /* ---------------------------------------------------------------- */
  var API = {
    add: add, addSlug: addSlug, remove: remove, setQty: setQty, clear: clear,
    all: all, has: has, count: count, subtotal: subtotal, pricedCount: pricedCount,
    onChange: onChange, open: open, close: close, toast: toast,
    priceLabel: priceLabel, amountOf: amountOf, money: money, src: src, bare: bare,
    waLink: waLink, waText: waText, WA: WA
  };
  window.FotileBasket = API;
  window.FotileCart   = API;          /* older pages call it this */
  window.FotileCartWire = scan;
})();
