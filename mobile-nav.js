/* ============================================================================
   FOTILE — UNIFIED SITE NAV  (file kept as mobile-nav.js so every page loads it)
   • Standardises the navbar on every page (same links, order, look)
   • Brand + Home always point to the new cinematic homepage ("/")
   • Correct active-page highlight
   • "Products" mega-menu on hover (desktop)
   • Hamburger slide-in menu (mobile) with categories
   • Makes clean-URL links work when opening files directly (file://)
   ========================================================================== */
(function(){
  /* ---------------------------------------------------------------------------
     ANALYTICS — Google Analytics 4 + Meta (Facebook) Pixel.
     Loads on any real web host; skipped on local file:// previews so your
     testing doesn't pollute the data. Fires a PageView on every page.
     --------------------------------------------------------------------------- */
  if(location.protocol!=='file:' && !window.__fotileAnalytics){
    window.__fotileAnalytics=1;
    var GA_ID='G-53Z27BS2HX', FB_ID='1268862064078491';
    try{
      var gs=document.createElement('script');gs.async=true;
      gs.src='https://www.googletagmanager.com/gtag/js?id='+GA_ID;
      document.head.appendChild(gs);
      window.dataLayer=window.dataLayer||[];
      window.gtag=function(){window.dataLayer.push(arguments);};
      window.gtag('js',new Date());
      window.gtag('config',GA_ID);
    }catch(e){}
    try{
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init',FB_ID);window.fbq('track','PageView');
    }catch(e){}
  }

  /* ---- SEO: add Instagram + LinkedIn to Organization/Store sameAs (from Yoast) ---- */
  function augmentSchema(){
    try{
      var WANT=['https://www.facebook.com/fotile.pk','https://www.instagram.com/fotilepak/','https://www.linkedin.com/company/fotilepk/'];
      document.querySelectorAll('script[type="application/ld+json"]').forEach(function(sc){
        if(sc.textContent.indexOf('sameAs')<0) return;
        try{
          var j=JSON.parse(sc.textContent);
          var fix=function(o){ if(o&&typeof o==='object'){ if(o.sameAs!=null){ if(!Array.isArray(o.sameAs)) o.sameAs=[o.sameAs]; WANT.forEach(function(u){ if(o.sameAs.indexOf(u)<0) o.sameAs.push(u); });
            if(!o.telephone) o.telephone='+92-42-111-131-517';
            if(!o.contactPoint) o.contactPoint={'@type':'ContactPoint','telephone':'+92-42-111-131-517','contactType':'customer service','areaServed':'PK','availableLanguage':['en','ur']};
          } if(Array.isArray(o['@graph'])) o['@graph'].forEach(fix); } };
          if(Array.isArray(j)) j.forEach(fix); else fix(j);
          sc.textContent=JSON.stringify(j);
        }catch(e){}
      });
    }catch(e){}
  }

  var LINKS=[
    {label:'Home',        href:'/',              key:'home'},
    {label:'Products',    href:'/shop/',         key:'products', mega:true},
    {label:'Moon Series', href:'/moon-series/',  key:'moon'},
    {label:'About',       href:'/about-us/',     key:'about'},
    {label:'Journal',     href:'/blog/',         key:'journal'},
    {label:'Pulse',       href:'/newsletter/',   key:'pulse'},
    {label:'Dealers',     href:'/our-dealers/',  key:'dealers'},
    {label:'Service',     href:'/service-center/', key:'service'},
    {label:'Contact',     href:'/contact-us/',   key:'contact'}
  ];
  var CATS=[
    {name:'Refrigerator',      href:'/fridge/',                                                 desc:'NEW · The F20, coming soon'},
    {name:'Range Hoods',      href:'/product-category/kitchen-hood/',                          desc:'Powerful, whisper-quiet ventilation'},
    {name:'Hobs & Cooktops',  href:'/product-category/hobs/',                                  desc:'Gas, induction & ceramic'},
    {name:'Ovens',            href:'/product-category/oven/',                                  desc:'Electric, steam & 4-in-1'},
    {name:'Microwaves',       href:'/product-category/oven/microwave-oven-prices-in-pakistan/',desc:'Built-in & grill'},
    {name:'Dishwashers',      href:'/product-category/dish-washer/',                           desc:'In-sink & built-in'},
    {name:'Water Purifiers',  href:'/product-category/water-purifier/',                        desc:'Purity, measured'}
  ];

  function activeKey(){
    var p=(location.pathname||'').toLowerCase();
    if(document.getElementById('cine')) return 'home';
    if(p.indexOf('/shop')>-1 || p.indexOf('/product-category')>-1) return 'products';
    if(p.indexOf('/moon-series')>-1) return 'moon';
    if(p.indexOf('/about-us')>-1) return 'about';
    if(p.indexOf('/our-dealers')>-1) return 'dealers';
    if(p.indexOf('/contact-us')>-1) return 'contact';
    if(p.indexOf('/blog')>-1 || typeof window.__FORCE_SLUG!=='undefined') return 'journal';
    return '';
  }

  var css = ''
  + '#nav .nlinks{display:flex;align-items:center;gap:30px}'
  + '#nav .nlinks .snav-lnk,#nav .nlinks>a{position:relative;font-family:Manrope,system-ui,sans-serif;font-size:14px;font-weight:500;letter-spacing:.2px;color:#c7cace;text-decoration:none;padding:6px 0;transition:color .25s;white-space:nowrap;background:none;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:6px}'
  + '#nav .nlinks .snav-lnk:hover,#nav .nlinks>a:hover{color:#fff}'
  + '#nav .nlinks .snav-lnk.active,#nav .nlinks>a.active{color:#fff}'
  + '#nav .nlinks .snav-lnk.active::after,#nav .nlinks>a.active::after{content:"";position:absolute;left:0;right:0;bottom:-4px;height:2px;border-radius:2px;background:linear-gradient(90deg,#c8ccd2,#eef1f4)}'
  + '#nav .snav-car{font-size:9px;opacity:.7;transition:transform .3s}'
  + '#nav .snav-prod{position:relative;display:inline-flex;align-items:center}'
  + '#nav .snav-prod:hover .snav-car{transform:rotate(180deg)}'
  + '.snav-mega{position:fixed;left:0;right:0;top:0;z-index:1000;display:flex;justify-content:center;padding:66px 24px 24px;opacity:0;visibility:hidden;transform:translateY(-10px);pointer-events:none;transition:opacity .3s cubic-bezier(.16,1,.3,1),transform .3s cubic-bezier(.16,1,.3,1)}'
  + '.snav-mega.show{opacity:1;visibility:visible;transform:none}'
  + '.snav-mega-in{width:100%;max-width:940px;pointer-events:auto;display:grid;grid-template-columns:1.6fr 1fr;gap:26px;background:rgba(14,15,18,.94);backdrop-filter:blur(24px) saturate(140%);-webkit-backdrop-filter:blur(24px) saturate(140%);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:26px;box-shadow:0 40px 90px rgba(0,0,0,.6)}'
  + '.snav-cats-h{font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:#7d818a;font-weight:700;margin-bottom:16px}'
  + '.snav-cgrid{display:grid;grid-template-columns:1fr 1fr;gap:6px}'
  + '.snav-cat{display:block;padding:13px 14px;border-radius:12px;text-decoration:none;transition:background .2s,transform .2s;border:1px solid transparent}'
  + '.snav-cat:hover{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.09)}'
  + '.snav-cat b{display:block;font-size:14.5px;font-weight:600;color:#f1f2f4;letter-spacing:-.2px}'
  + '.snav-cat span{display:block;font-size:12px;color:#868a91;margin-top:3px;font-weight:300}'
  + '.snav-feat{position:relative;display:flex;flex-direction:column;justify-content:flex-end;border-radius:14px;text-decoration:none;overflow:hidden;padding:22px;min-height:190px;background:radial-gradient(120% 100% at 20% 0%,#2a2d33 0%,#141518 55%,#0d0e11 100%);border:1px solid rgba(255,255,255,.09)}'
  + '.snav-feat-k{font-size:10.5px;letter-spacing:1.6px;text-transform:uppercase;color:#c8ccd2;font-weight:700}'
  + '.snav-feat-t{font-size:22px;font-weight:200;letter-spacing:-.6px;color:#fff;margin:8px 0 14px;line-height:1.1}'
  + '.snav-feat-go{font-size:13px;font-weight:600;color:#eef1f4}.snav-feat:hover .snav-feat-go{color:#fff}'
  + '.snav-feat-go span{color:#c8ccd2}'
  + 'html,body{overflow-x:hidden;max-width:100%}'
  + '*{-webkit-tap-highlight-color:transparent}'
  + '.navtoggle{display:none;flex-direction:column;justify-content:center;gap:5px;width:30px;height:26px;background:none;border:none;padding:0;cursor:pointer;z-index:1002}'
  + '.navtoggle span{display:block;height:2px;width:26px;background:#fff;border-radius:2px;transition:.32s cubic-bezier(.16,1,.3,1)}'
  + '.navtoggle.open span:nth-child(1){transform:translateY(7px) rotate(45deg)}'
  + '.navtoggle.open span:nth-child(2){opacity:0}'
  + '.navtoggle.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}'
  + '.mobmenu{position:fixed;inset:0;z-index:1001;background:rgba(8,9,11,.975);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);display:flex;flex-direction:column;justify-content:flex-start;gap:0;padding:96px 30px 40px;transform:translateX(100%);transition:transform .45s cubic-bezier(.16,1,.3,1);overflow-y:auto}'
  + '.mobmenu.open{transform:none}'
  + '.mobmenu a{font-size:22px;font-weight:300;letter-spacing:-.5px;color:#eef0f2;padding:15px 2px;border-bottom:1px solid rgba(255,255,255,.09);transition:.25s;text-decoration:none}'
  + '.mobmenu a.active{color:#fff}'
  + '.mobmenu a:active{color:#fff;padding-left:8px}'
  + '.mobmenu .mm-sub{font-size:15px;color:#9aa0a8;padding:11px 2px 11px 16px;border-bottom:1px solid rgba(255,255,255,.05)}'
  + '.mobmenu a.cta{margin-top:26px;border:none;color:#14171b;background:linear-gradient(135deg,#c8ccd2,#eef1f4);border-radius:8px;text-align:center;padding:17px;font-weight:600;font-size:16px;letter-spacing:0}'
  + '@media(max-width:860px){#nav .nlinks{display:none!important}.snav-mega{display:none!important}.navtoggle{display:flex}#nav .nr .ic{display:none}#nav .nr .npill{display:none}#nav .nr{gap:14px}.flag{display:none!important}.cbar{display:none!important}#nav.nav{opacity:1!important;pointer-events:auto!important;margin-top:0!important;background:rgba(12,11,10,.9);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid rgba(255,255,255,.08)}}'
  + '@media(min-width:861px){.navtoggle{display:none!important}.mobmenu{display:none!important}}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  function build(){
    var nav=document.querySelector('#nav')||document.querySelector('.nav');
    if(!nav||nav.__snav) return; nav.__snav=1;
    var akey=activeKey();

    var brand=nav.querySelector('.brand');
    if(brand){
      if(brand.tagName!=='A'){
        var img=brand.querySelector('img');
        var a=document.createElement('a'); a.className='brand'; a.setAttribute('href','/');
        if(img) a.appendChild(img); else a.innerHTML=brand.innerHTML;
        brand.parentNode.replaceChild(a,brand);
      } else { brand.setAttribute('href','/'); }
    }

    var nl=nav.querySelector('.nlinks');
    if(nl){
      var html='';
      LINKS.forEach(function(l){
        var act=(l.key===akey)?' active':'';
        if(l.mega){
          html+='<span class="snav-prod">'
             +  '<a class="snav-lnk'+act+'" href="'+l.href+'">'+l.label+' <span class="snav-car">▾</span></a>'
             +  '<div class="snav-mega"><div class="snav-mega-in">'
             +    '<div class="snav-cats"><div class="snav-cats-h">Shop by category</div><div class="snav-cgrid">'
             +      CATS.map(function(c){return '<a class="snav-cat" href="'+c.href+'"><b>'+c.name+'</b><span>'+c.desc+'</span></a>';}).join('')
             +    '</div></div>'
             +    '<a class="snav-feat" href="/shop/"><div class="snav-feat-k">The Full Collection</div><div class="snav-feat-t">Every Fotile<br>appliance</div><div class="snav-feat-go">Browse all 58 <span>&rarr;</span></div></a>'
             +  '</div></div>'
             +  '</span>';
        } else {
          html+='<a class="snav-lnk'+act+'" href="'+l.href+'">'+l.label+'</a>';
        }
      });
      nl.innerHTML=html;
    }

    var pill=nav.querySelector('.npill'); if(pill) pill.setAttribute('href','/contact-us/');

    var prod=nav.querySelector('.snav-prod');
    var mega=prod&&prod.querySelector('.snav-mega');
    if(prod&&mega){
      var t;
      var open=function(){clearTimeout(t);mega.classList.add('show');};
      var close=function(){t=setTimeout(function(){mega.classList.remove('show');},160);};
      var megaIn=mega.querySelector('.snav-mega-in')||mega;
      prod.addEventListener('mouseenter',open);
      prod.addEventListener('mouseleave',close);
      megaIn.addEventListener('mouseenter',open);
      megaIn.addEventListener('mouseleave',close);
    }

    var nr=nav.querySelector('.nr')||nav;
    var btn=document.createElement('button');
    btn.className='navtoggle'; btn.setAttribute('aria-label','Open menu');
    btn.innerHTML='<span></span><span></span><span></span>';
    nr.appendChild(btn);
    var menu=document.createElement('div'); menu.className='mobmenu';
    var mh='';
    LINKS.forEach(function(l){
      var act=(l.key===akey)?'active':'';
      mh+='<a class="'+act+'" href="'+l.href+'">'+l.label+'</a>';
      if(l.mega){ CATS.forEach(function(c){ mh+='<a class="mm-sub" href="'+c.href+'">'+c.name+'</a>'; }); }
    });
    mh+='<a class="cta" href="/contact-us/">Request a Quote</a>';
    menu.innerHTML=mh; document.body.appendChild(menu);
    function toggle(open){btn.classList.toggle('open',open);menu.classList.toggle('open',open);document.documentElement.style.overflow=open?'hidden':'';}
    btn.addEventListener('click',function(){toggle(!menu.classList.contains('open'));});
    menu.addEventListener('click',function(e){if(e.target.tagName==='A')toggle(false);});
    addEventListener('resize',function(){if(innerWidth>860)toggle(false);});

    /* ---- newsletter subscribe boxes -> real send (FormSubmit) ---- */
    document.querySelectorAll('form').forEach(function(f){
      if(f.id==='cform'||f.__news) return;
      var em=f.querySelector('input[type=email]'); if(!em) return;
      if(f.querySelector('textarea')) return;           // that's the contact form, skip
      f.__news=1; f.removeAttribute('onsubmit');
      f.addEventListener('submit',function(e){
        e.preventDefault(); var val=(em.value||'').trim(); if(!val) return;
        var btn=f.querySelector('button');
        try{fetch('https://formsubmit.co/ajax/raahimsohail6@gmail.com',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({Reason:'Newsletter Signup',Email:val,_subject:'Fotile Website — Newsletter Signup',_cc:'sarfrazahmed@fotile.pk'})}).catch(function(){});}catch(x){}
        em.value='Subscribed ✓'; if(btn) btn.disabled=true;
      });
    });

    /* ---- footer: real social links (Yoast profiles) + fix placeholder links ---- */
    var ft=document.querySelector('footer');
    if(ft){
      var socUrls=['https://www.facebook.com/fotile.pk','https://www.instagram.com/fotilepak/','https://www.linkedin.com/company/fotilepk/','https://www.youtube.com/results?search_query=fotile+pakistan'];
      ft.querySelectorAll('.fsoc a').forEach(function(a,i){ if(socUrls[i]){a.setAttribute('href',socUrls[i]);a.setAttribute('target','_blank');a.setAttribute('rel','noopener');} });
      var FMAP={'Range Hoods':'/product-category/kitchen-hood/','Ovens':'/product-category/oven/','Hobs':'/product-category/hobs/','Dishwashers':'/product-category/dish-washer/','Purifiers':'/product-category/water-purifier/','Blog':'/blog/','FAQ':'/faq/','Schedule Service':'/service-center/','Track Order':'/contact-us/','Warranty':'/service-center/'};
      ft.querySelectorAll('a').forEach(function(a){
        var t=(a.textContent||'').trim();
        if(a.getAttribute('href')==='#'&&FMAP[t]) a.setAttribute('href',FMAP[t]);
        if(t.indexOf('042-')>-1) a.setAttribute('href','tel:+924211131517');
      });
    }
  }
  function ready(){ build(); augmentSchema(); }
  if(document.readyState!=='loading') ready();
  else document.addEventListener('DOMContentLoaded',ready);

  /* ------------------------------------------------------------------
     PORTABLE LINKS
     Internal links are written root-absolute (/shop/, /fridge/) which is
     correct when the site sits at a domain root (fotilepk.com). This makes
     those same links work when it does NOT:
       • opened straight from disk        (file://)
       • hosted inside a subfolder        (GitHub Pages project site,
                                           /preview/, staging folders)
     Completely inert when the site IS at the domain root.
     ------------------------------------------------------------------ */
  if(!window.__lnavInstalled){
    var isFile = (location.protocol==='file:');
    var rootPath = '/';
    try{ rootPath = new URL(window.__PBASE||'./', location.href).pathname; }catch(e){}
    var inSub = (!isFile && rootPath !== '/');

    if(isFile || inSub){
      window.__lnavInstalled=1;

      var fix=function(href){
        var p=href, sfx=''; var qi=href.search(/[?#]/);
        if(qi>=0){ p=href.slice(0,qi); sfx=href.slice(qi); }
        p=p.replace(/^\/+/,'');
        if(isFile){
          var last=p.substring(p.lastIndexOf('/')+1);
          if(p===''||p.charAt(p.length-1)==='/'){ p+='index.html'; }
          else if(last.indexOf('.')===-1){ p+='/index.html'; }
          return (window.__PBASE||'')+p+sfx;
        }
        return rootPath+p+sfx;
      };

      var mo=null;
      var sweep=function(){
        if(mo) mo.disconnect();
        var as=document.getElementsByTagName('a');
        for(var i=0;i<as.length;i++){
          var a=as[i];
          if(a.getAttribute('data-lnav')) continue;
          var h=a.getAttribute('href');
          if(!h||h.charAt(0)!=='/'||h.charAt(1)==='/'){ a.setAttribute('data-lnav','skip'); continue; }
          a.setAttribute('href',fix(h));
          a.setAttribute('data-lnav','1');
        }
        if(mo) mo.observe(document.documentElement,{childList:true,subtree:true});
      };

      var boot=function(){
        sweep();
        if(window.MutationObserver){
          var t=null;
          mo=new MutationObserver(function(){ clearTimeout(t); t=setTimeout(sweep,60); });
          mo.observe(document.documentElement,{childList:true,subtree:true});
        }
      };
      if(document.readyState!=='loading') boot();
      else document.addEventListener('DOMContentLoaded',boot);

      /* Backstop for a link created and clicked before a sweep could run.
         MUST ignore links the sweep already rewrote, otherwise the prefix
         would be applied twice (/site/ -> /site/site/). */
      document.addEventListener('click',function(e){
        var a=e.target.closest&&e.target.closest('a'); if(!a) return;
        if(a.getAttribute('data-lnav')) return;      /* already handled */
        var href=a.getAttribute('href');
        if(!href||href.charAt(0)!=='/'||href.charAt(1)==='/') return;
        a.setAttribute('data-lnav','1');
        e.preventDefault();
        location.href=fix(href);
      },true);
    }
  }
})();

/* ============================================================================
   PRODUCT 360 STUDIO — loader
   Product pages that have several photos (different angles, or colour/finish
   variants) get a drag-to-rotate viewer. The viewer script decides for itself
   whether the current product has extra views, so this just loads it on any
   page that shows a product image. Nothing changes on products that only have
   one photo.
   ========================================================================== */
(function(){
  function load(){
    if(!document.querySelector('.pdp-stage')) return;
    if(window.__pgLoaded) return; window.__pgLoaded=1;
    var s=document.createElement('script');
    s.src=(window.__PBASE||'')+'product-gallery.js';
    s.defer=true;
    document.body.appendChild(s);
  }
  if(document.readyState!=='loading') load();
  else document.addEventListener('DOMContentLoaded',load);
})();
