/* =====================================================================
   FOTILE · HOME OPENING — "From Ningbo to Pakistan"
   A dotted world drawn from Natural Earth (world-dots.js). Fotile's
   markets light up, arcs fly out from Ningbo, then the camera flies
   down into Pakistan, the cities appear, the logo lands, and the page
   opens underneath.  Plays once per browser session.  Skippable.
   Markets shown are the ones Fotile publicly names; edit MARKETS below.
   ===================================================================== */
(function(){
  var WD = window.__WD;
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var seen = false;
  try{ seen = sessionStorage.getItem('fotile_intro_seen') === '1'; }catch(e){}
  if(/[?&]intro=1/.test(location.search)) seen = false;
  if(!WD || reduce || seen || /[?&]nointro/.test(location.search)) return;

  window.__WI_ACTIVE = true;
  try{ sessionStorage.setItem('fotile_intro_seen','1'); }catch(e){}

  /* ---------- markets (lon, lat) --------------------------------------- */
  var HQ = { n:'Ningbo', lon:121.55, lat:29.87 };
  var MARKETS = [
    { n:'United States', lon:-118.24, lat:34.05 },
    { n:'Canada',        lon:-79.38,  lat:43.65 },
    { n:'Australia',     lon:151.21,  lat:-33.87 },
    { n:'Malaysia',      lon:101.69,  lat:3.14 },
    { n:'Thailand',      lon:100.50,  lat:13.75 },
    { n:'Singapore',     lon:103.82,  lat:1.35 },
    { n:'Indonesia',     lon:106.85,  lat:-6.20 },
    { n:'Pakistan',      lon:74.35,   lat:31.55, pk:true }
  ];
  var PK_CITIES = [
    { n:'Islamabad', lon:73.05, lat:33.69, dx:1,  dy:-1 },
    { n:'Lahore',    lon:74.35, lat:31.55, dx:1,  dy:0  },
    { n:'Karachi',   lon:67.01, lat:24.86, dx:1,  dy:0  }
  ];
  var PK_C = { lon:69.3, lat:30.2 };

  /* ---------- DOM + style ---------------------------------------------- */
  var css = ''
  + 'html.wilock,html.wilock body{overflow:hidden!important}'
  + '#wintro{position:fixed;inset:0;z-index:99990;background:#07070a;cursor:pointer;overflow:hidden;'
  +   'transition:opacity .9s cubic-bezier(.16,1,.3,1)}'
  + '#wintro.out{opacity:0;pointer-events:none}'
  + '#wintro canvas{position:absolute;inset:0;width:100%;height:100%;display:block}'
  + '#wintro .wi-vig{position:absolute;inset:0;pointer-events:none;'
  +   'background:radial-gradient(120% 90% at 50% 50%,transparent 55%,rgba(0,0,0,.6))}'
  + '#wintro .wi-top{position:absolute;left:0;right:0;top:9vh;text-align:center;pointer-events:none;'
  +   'font:700 10px/1 Manrope,system-ui,sans-serif;letter-spacing:5px;text-transform:uppercase;color:rgba(240,200,190,.62);'
  +   'opacity:0;transition:opacity .7s,transform .9s cubic-bezier(.16,1,.3,1);transform:translateY(8px)}'
  + '#wintro .wi-top b{display:block;margin-top:14px;font:200 clamp(22px,3vw,34px)/1.15 Manrope,system-ui,sans-serif;'
  +   'letter-spacing:-.5px;text-transform:none;color:#f4f2f3}'
  + '#wintro .wi-top b i{font-style:normal;font-weight:600;color:#ff4a60}'
  + '#wintro .wi-top.on{opacity:1;transform:none}'
  + '#wintro .wi-pk{position:absolute;left:0;right:0;bottom:11vh;text-align:center;pointer-events:none;opacity:0;'
  +   'transform:translateY(10px);transition:opacity .8s,transform 1s cubic-bezier(.16,1,.3,1)}'
  + '#wintro .wi-pk.on{opacity:1;transform:none}'
  + '#wintro .wi-pk b{display:block;font:200 clamp(38px,7vw,84px)/1 Manrope,system-ui,sans-serif;letter-spacing:.24em;'
  +   'text-indent:.24em;color:#fff}'
  + '#wintro .wi-pk span{display:block;margin-top:14px;font:700 10px/1 Manrope,system-ui,sans-serif;letter-spacing:5px;'
  +   'text-transform:uppercase;color:rgba(255,120,135,.8)}'
  + '#wintro .wi-logo{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(.92);opacity:0;'
  +   'pointer-events:none;text-align:center;transition:opacity .7s,transform 1.1s cubic-bezier(.16,1,.3,1)}'
  + '#wintro .wi-logo img{width:min(300px,56vw);height:auto;display:block;filter:brightness(0) invert(1) drop-shadow(0 0 30px rgba(255,80,100,.35))}'
  + '#wintro .wi-logo i{display:block;height:2px;margin:18px auto 0;width:0;background:linear-gradient(90deg,transparent,#e01e37,transparent);'
  +   'transition:width 1s .15s cubic-bezier(.16,1,.3,1)}'
  + '#wintro .wi-logo em{display:block;margin-top:16px;font:500 11px/1 Manrope,system-ui,sans-serif;letter-spacing:4px;'
  +   'text-transform:uppercase;color:rgba(255,255,255,.55);font-style:normal}'
  + '#wintro .wi-logo.on{opacity:1;transform:translate(-50%,-50%) scale(1)}'
  + '#wintro .wi-logo.on i{width:70%}'
  + '@media(max-width:600px){#wintro .wi-pk span{letter-spacing:2.4px;font-size:9px}#wintro .wi-top b{font-size:20px}}'
  + '#wintro .wi-snd{position:absolute;left:50%;bottom:22px;transform:translate(-50%,8px);z-index:3;display:flex;align-items:center;gap:10px;'
  +   'padding:11px 20px 11px 16px;border-radius:40px;border:1px solid rgba(255,255,255,.22);background:rgba(20,18,22,.6);'
  +   'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);color:#fff;cursor:pointer;opacity:0;pointer-events:none;'
  +   'font:700 10px/1 Manrope,system-ui,sans-serif;letter-spacing:2.6px;text-transform:uppercase;transition:opacity .5s,transform .6s cubic-bezier(.16,1,.3,1),background .3s}'
  + '#wintro .wi-snd.show{opacity:1;transform:translate(-50%,0);pointer-events:auto}'
  + '#wintro .wi-snd:hover{background:rgba(224,30,55,.55);border-color:rgba(255,120,135,.6)}'
  + '#wintro .wi-snd svg{width:16px;height:16px;display:block}'
  + '#wintro .wi-snd.on{opacity:0;pointer-events:none}'
  + '#wintro .wi-skip{position:absolute;right:22px;bottom:20px;font:700 9px/1 Manrope,system-ui,sans-serif;letter-spacing:2.6px;'
  +   'text-transform:uppercase;color:rgba(255,255,255,.34);pointer-events:none}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var base = window.__PBASE || '';
  var el = document.createElement('div'); el.id = 'wintro'; el.setAttribute('aria-hidden','true');
  el.innerHTML = '<canvas></canvas><div class="wi-vig"></div>'
    + '<div class="wi-top">Since 1996 · From Ningbo<b>One kitchen, <i>around the world.</i></b></div>'
    + '<div class="wi-pk"><b>PAKISTAN</b><span>Fotile Pakistan · Lahore · Karachi · Islamabad</span></div>'
    + '<div class="wi-logo"><img src="' + base + 'assets/logo.png" alt=""><i></i><em>Happiness starts in your kitchen</em></div>'
    + '<button class="wi-snd" type="button" aria-label="Turn on sound"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>Sound on</button>'
    + '<div class="wi-skip">Tap to skip</div>';
  document.body.insertBefore(el, document.body.firstChild);
  root.classList.add('wilock');
  var failsafe = setTimeout(function(){ finish(); }, 9000);

  var cv = el.querySelector('canvas'), cx = cv.getContext('2d');
  var hudTop = el.querySelector('.wi-top'), hudPk = el.querySelector('.wi-pk'), hudLogo = el.querySelector('.wi-logo');

  /* ---------- geometry -------------------------------------------------- */
  var DOTS = [];                       // {x,y (map units 0..1), k, d (delay)}
  var LAT0 = WD.lat0, LON0 = WD.lon0, STEP = WD.step, SPAN_LAT = 136;
  function mx(lon){ return (lon - LON0) / 360; }
  function my(lat){ return (LAT0 - lat) / SPAN_LAT; }
  WD.rows.forEach(function(row, r){
    for(var c = 0; c < row.length; c++){
      var k = row.charAt(c); if(k === '.') continue;
      var lon = LON0 + (c + .5) * STEP, lat = LAT0 - (r + .5) * STEP;
      DOTS.push({ x: mx(lon), y: my(lat), k: k, lon: lon, lat: lat });
    }
  });
  var PKD = WD.pk.map(function(p){ return { x: mx(p[0]), y: my(p[1]) }; });
  var hq = { x: mx(HQ.lon), y: my(HQ.lat) };
  MARKETS.forEach(function(m, i){ m.x = mx(m.lon); m.y = my(m.lat); m.i = i; });
  PK_CITIES.forEach(function(m){ m.x = mx(m.lon); m.y = my(m.lat); });
  var pkc = { x: mx(PK_C.lon), y: my(PK_C.lat) };
  // reveal order: outward from Ningbo
  DOTS.forEach(function(d){ d.d = Math.min(1, Math.hypot((d.x - hq.x) * 2.4, d.y - hq.y) / 1.25); d.r = Math.random(); });

  var W, H, DPR, MW, MH, zEnd;
  function size(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    MW = Math.min(W * 0.94, H * 0.86 * (360 / SPAN_LAT)); MH = MW * SPAN_LAT / 360;
    var pkW = (WD.pkBox[2] - WD.pkBox[0]) / 360 * MW, pkH = (WD.pkBox[3] - WD.pkBox[1]) / SPAN_LAT * MH;
    zEnd = Math.min(W * (W < 700 ? .66 : .46) / pkW, H * .52 / pkH);
  }
  size(); addEventListener('resize', size);

  /* ---------- timing helpers ------------------------------------------- */
  function cl(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }
  function seg(t, a, b){ return cl((t - a) / (b - a)); }
  function eio(x){ return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function eo(x){ return 1 - Math.pow(1 - x, 3); }

  /* start camera centred on the old world, end on Pakistan */
  var cam0 = { x: mx(4), y: my(12), z: 1 };
  function camAt(t){
    var k = eio(seg(t, 1.75, 3.05));
    var z = Math.exp(Math.log(cam0.z) + (Math.log(zEnd) - Math.log(cam0.z)) * k);
    // keep the target drifting in early so the flight curves, not slides
    var kc = 1 - Math.pow(1 - k, 1.6);
    return { x: cam0.x + (pkc.x - cam0.x) * kc, y: cam0.y + (pkc.y - cam0.y) * kc, z: z };
  }
  function S(p, cam){ return { x: W / 2 + (p.x - cam.x) * MW * cam.z, y: H / 2 + (p.y - cam.y) * MH * cam.z }; }

  /* ---------- draw ------------------------------------------------------ */
  var t0 = performance.now(), raf = 0, done = false, flags = {};
  function frame(now){
    if(done) return;
    var t = (now - t0) / 1000; curT = t;
    var cam = camAt(t);
    cx.clearRect(0, 0, W, H);

    // a soft red bloom that rides toward Pakistan as we fly
    var glow = seg(t, 2.2, 3.1);
    if(glow > 0){
      var g = S(pkc, cam), gr = Math.max(W, H) * .42;
      var rg = cx.createRadialGradient(g.x, g.y, 0, g.x, g.y, gr);
      rg.addColorStop(0, 'rgba(224,30,55,' + (.20 * glow) + ')'); rg.addColorStop(1, 'rgba(224,30,55,0)');
      cx.fillStyle = rg; cx.fillRect(0, 0, W, H);
    }

    // world dots
    var worldA = 1 - seg(t, 2.25, 2.85);
    if(worldA > 0){
      var cell = STEP / 360 * MW * cam.z;
      var r = Math.max(.7, Math.min(cell * .32, 5));
      var mark = seg(t, .55, 1.5);
      for(var i = 0; i < DOTS.length; i++){
        var d = DOTS[i];
        var a = cl((t - d.d * .85) / .35) * worldA; if(a <= 0) continue;
        var sx = W / 2 + (d.x - cam.x) * MW * cam.z, sy = H / 2 + (d.y - cam.y) * MH * cam.z;
        if(sx < -10 || sx > W + 10 || sy < -10 || sy > H + 10) continue;
        var col;
        if(d.k === 'o'){ col = 'rgba(210,214,226,' + (.20 * a) + ')'; }
        else {
          var mk = cl((mark - d.r * .35) / .65);
          if(d.k === 'H'){ col = 'rgba(' + (210 + 20 * mk | 0) + ',' + (214 - 34 * mk | 0) + ',' + (226 - 120 * mk | 0) + ',' + ((.20 + .30 * mk) * a) + ')'; }
          else { col = 'rgba(' + (210 + 30 * mk | 0) + ',' + (214 - 170 * mk | 0) + ',' + (226 - 160 * mk | 0) + ',' + ((.20 + (d.k === 'P' ? .62 : .48) * mk) * a) + ')'; }
        }
        cx.fillStyle = col; cx.beginPath(); cx.arc(sx, sy, r, 0, 6.2832); cx.fill();
      }
    }

    // Pakistan, drawn fine once we are close
    var pkA = seg(t, 2.25, 2.95);
    if(pkA > 0){
      var pcell = .25 / 360 * MW * cam.z, pr = Math.max(.8, Math.min(pcell * .34, 4.2));
      var pulse = .82 + .18 * Math.sin(t * 3);
      for(var j = 0; j < PKD.length; j++){
        var q = PKD[j];
        var qx = W / 2 + (q.x - cam.x) * MW * cam.z, qy = H / 2 + (q.y - cam.y) * MH * cam.z;
        if(qx < -6 || qx > W + 6 || qy < -6 || qy > H + 6) continue;
        var dist = Math.hypot(q.x - pkc.x, (q.y - pkc.y) * .6);
        var la = cl((pkA * 1.4 - dist * 9)) * pkA;
        cx.fillStyle = 'rgba(255,' + (70 + 40 * (1 - la) | 0) + ',92,' + (.78 * la * pulse) + ')';
        cx.beginPath(); cx.arc(qx, qy, pr, 0, 6.2832); cx.fill();
      }
    }

    // arcs from Ningbo
    var arcA = 1 - seg(t, 1.95, 2.45);
    if(arcA > 0){
      var H0 = S(hq, cam);
      for(var m = 0; m < MARKETS.length; m++){
        var M = MARKETS[m];
        var p = eo(seg(t, .75 + m * .075, 1.45 + m * .075)); if(p <= 0) continue;
        var keep = M.pk ? (1 - seg(t, 2.35, 2.75)) : arcA;
        var B = S(M, cam);
        var dx = B.x - H0.x, dy = B.y - H0.y, len = Math.hypot(dx, dy);
        var ctrl = { x: (H0.x + B.x) / 2 - dy * .0 , y: (H0.y + B.y) / 2 - len * .32 };
        cx.lineWidth = M.pk ? 1.6 : 1.1;
        cx.strokeStyle = M.pk ? 'rgba(255,90,110,' + (.85 * keep) + ')' : 'rgba(255,120,135,' + (.45 * keep) + ')';
        cx.beginPath(); cx.moveTo(H0.x, H0.y);
        var N = 36, hx = H0.x, hy = H0.y;
        for(var s = 1; s <= N * p; s++){
          var u = s / N, iu = 1 - u;
          hx = iu * iu * H0.x + 2 * iu * u * ctrl.x + u * u * B.x;
          hy = iu * iu * H0.y + 2 * iu * u * ctrl.y + u * u * B.y;
          cx.lineTo(hx, hy);
        }
        cx.stroke();
        if(p < 1){ cx.fillStyle = 'rgba(255,220,225,' + keep + ')'; cx.beginPath(); cx.arc(hx, hy, 2.2, 0, 6.2832); cx.fill(); }
        else if(keep > 0){
          var ring = (t * 1.3 + m * .17) % 1;
          cx.strokeStyle = 'rgba(255,90,110,' + ((1 - ring) * .7 * keep) + ')'; cx.lineWidth = 1;
          cx.beginPath(); cx.arc(B.x, B.y, 3 + ring * 11, 0, 6.2832); cx.stroke();
          cx.fillStyle = 'rgba(255,140,150,' + keep + ')'; cx.beginPath(); cx.arc(B.x, B.y, 2.4, 0, 6.2832); cx.fill();
        }
      }
      // Ningbo
      var ha = cl(t / .5) * arcA;
      cx.fillStyle = 'rgba(240,200,140,' + ha + ')'; cx.beginPath(); cx.arc(H0.x, H0.y, 3.2, 0, 6.2832); cx.fill();
      cx.strokeStyle = 'rgba(240,200,140,' + (.5 * ha) + ')'; cx.lineWidth = 1;
      cx.beginPath(); cx.arc(H0.x, H0.y, 7 + 3 * Math.sin(t * 4), 0, 6.2832); cx.stroke();
      if(ha > .05){
        cx.font = '600 10px Manrope,system-ui,sans-serif'; cx.fillStyle = 'rgba(240,200,140,' + (.8 * ha) + ')';
        cx.fillText('NINGBO', H0.x + 10, H0.y - 8);
      }
    }

    // Pakistan's cities
    var cityA = seg(t, 2.7, 3.15) * (1 - seg(t, 3.55, 3.9));
    if(cityA > 0){
      cx.font = '600 ' + (W < 700 ? 10 : 12) + 'px Manrope,system-ui,sans-serif';
      PK_CITIES.forEach(function(c, i){
        var a = cl((cityA * 1.6) - i * .25); if(a <= 0) return;
        var P = S(c, cam), ring = (t * 1.1 + i * .3) % 1;
        cx.strokeStyle = 'rgba(255,255,255,' + ((1 - ring) * .7 * a) + ')'; cx.lineWidth = 1;
        cx.beginPath(); cx.arc(P.x, P.y, 4 + ring * 16, 0, 6.2832); cx.stroke();
        cx.fillStyle = 'rgba(255,255,255,' + a + ')'; cx.beginPath(); cx.arc(P.x, P.y, 3.4, 0, 6.2832); cx.fill();
        cx.fillStyle = 'rgba(255,255,255,' + (.9 * a) + ')';
        cx.fillText(c.n.toUpperCase(), P.x + 12, P.y + 4 + c.dy * 6);
      });
    }

    // settle the map down under the logo
    var dim = seg(t, 3.4, 3.85);
    if(dim > 0){ cx.fillStyle = 'rgba(7,7,10,' + (.72 * dim) + ')'; cx.fillRect(0, 0, W, H); }

    // the page-facing beats
    if(!flags.top && t > 1.0){ flags.top = 1; hudTop.classList.add('on'); }
    if(!flags.topOff && t > 2.1){ flags.topOff = 1; hudTop.classList.remove('on'); }
    if(!flags.pk && t > 2.75){ flags.pk = 1; hudPk.classList.add('on'); }
    if(!flags.pkOff && t > 3.35){ flags.pkOff = 1; hudPk.classList.remove('on'); }
    if(!flags.logo && t > 3.62){ flags.logo = 1; hudLogo.classList.add('on'); }
    if(!flags.unlock && t > 4.45){ flags.unlock = 1; root.classList.remove('wilock'); el.style.pointerEvents = 'none'; }
    if(t > 4.75){ finish(); return; }
    raf = requestAnimationFrame(frame);
  }

  function finish(){
    if(done) return; done = true;
    endScore(curT < 4.4);
    clearTimeout(failsafe);
    if(raf) cancelAnimationFrame(raf);
    root.classList.remove('wilock');
    el.classList.add('out');
    window.__WI_ACTIVE = false;
    try{ window.dispatchEvent(new Event('fotile:intro-done')); }catch(e){}
    setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 950);
  }

  /* ---------- the score -------------------------------------------------
     Synthesised live with Web Audio — no audio file. A low swell as the
     world appears, a bell for each market as its arc lands (Pakistan's is
     the deepest and last), a rushing wind for the flight down, a soft
     impact when Pakistan resolves and a warm chord under the logo.
     Browsers only allow sound after a tap, so if it can't start by itself
     a "Sound on" pill appears and picks the score up from where we are. */
  var curT = 0, AC = window.AudioContext || window.webkitAudioContext, ac = null, bus = null, scoreOn = false;
  var sndBtn = el.querySelector('.wi-snd');
  function mtof(m){ return 440 * Math.pow(2, (m - 69) / 12); }
  function impulse(sec){
    var n = Math.floor(ac.sampleRate * sec), b = ac.createBuffer(2, n, ac.sampleRate);
    for(var c = 0; c < 2; c++){ var d = b.getChannelData(c); for(var i = 0; i < n; i++){ var k = i / n; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - k, 2.4); } }
    return b;
  }
  function noiseBuf(sec){
    var n = Math.floor(ac.sampleRate * sec), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
    for(var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function buildBus(){
    bus = ac.createGain(); bus.gain.value = 0.0001;
    var comp = ac.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3; comp.knee.value = 18;
    var rev = ac.createConvolver(); rev.buffer = impulse(3.0);
    var wet = ac.createGain(); wet.gain.value = .5; var dry = ac.createGain(); dry.gain.value = .8;
    bus.connect(dry); bus.connect(rev); rev.connect(wet); dry.connect(comp); wet.connect(comp); comp.connect(ac.destination);
  }
  function env(g, at, a, peak, dec){
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(peak, at + a);
    g.gain.exponentialRampToValueAtTime(0.0001, at + a + dec);
  }
  function bell(midi, at, vel){
    var out = ac.createGain(), pan = ac.createStereoPanner ? ac.createStereoPanner() : null;
    if(pan){ pan.pan.value = (Math.random() * 2 - 1) * .55; out.connect(pan); pan.connect(bus); } else out.connect(bus);
    [[1, 1], [2.01, .32], [2.76, .14]].forEach(function(pp){
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = mtof(midi) * pp[0];
      env(g, at, .006, vel * pp[1], 1.9 - pp[0] * .3);
      o.connect(g); g.connect(out); o.start(at); o.stop(at + 2.2);
    });
  }
  function drone(at, until){
    [[33, .10, 'sine'], [40, .06, 'sine'], [45, .025, 'triangle']].forEach(function(v){
      var o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter();
      o.type = v[2]; o.frequency.value = mtof(v[0]); f.type = 'lowpass'; f.frequency.value = 520;
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(v[1], at + 1.4);
      g.gain.setValueAtTime(v[1], until - 1.3); g.gain.exponentialRampToValueAtTime(0.0001, until);
      o.connect(f); f.connect(g); g.connect(bus); o.start(at); o.stop(until + .1);
    });
  }
  function whoosh(at, peakAt, end){
    var src = ac.createBufferSource(); src.buffer = noiseBuf(end - at + .3);
    var bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.1;
    bp.frequency.setValueAtTime(260, at); bp.frequency.exponentialRampToValueAtTime(2600, peakAt); bp.frequency.exponentialRampToValueAtTime(700, end);
    var g = ac.createGain(); g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(.34, peakAt); g.gain.exponentialRampToValueAtTime(0.0001, end);
    src.connect(bp); bp.connect(g); g.connect(bus); src.start(at); src.stop(end + .1);
  }
  function thud(at){
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(92, at); o.frequency.exponentialRampToValueAtTime(42, at + .9);
    env(g, at, .012, .42, 1.3); o.connect(g); g.connect(bus); o.start(at); o.stop(at + 1.5);
  }
  function chord(at){
    [[50, .10, 'triangle'], [57, .08, 'sine'], [62, .075, 'sine'], [66, .06, 'sine'], [69, .045, 'sine'], [76, .03, 'sine']].forEach(function(v, i){
      var o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain();
      o.type = v[2]; o2.type = 'sine'; o.frequency.value = mtof(v[0]); o2.frequency.value = mtof(v[0]); o2.detune.value = 7;
      var s = at + i * .045;
      g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(v[1], s + .09); g.gain.exponentialRampToValueAtTime(0.0001, s + 4.2);
      o.connect(g); o2.connect(g); g.connect(bus); o.start(s); o2.start(s); o.stop(s + 4.4); o2.stop(s + 4.4);
    });
    bell(86, at + .12, .05); bell(93, at + .30, .035);
  }
  function startScore(){
    if(scoreOn || !ac || done) return; scoreOn = true;
    buildBus();
    var now = ac.currentTime, T = curT, base = now - T;
    function at(x){ return Math.max(now + .02, base + x); }
    bus.gain.setValueAtTime(0.0001, now); bus.gain.exponentialRampToValueAtTime(.62, now + .5);
    if(T < 3.6) drone(at(Math.max(0, T)), base + 5.2);
    var scale = [62, 64, 66, 69, 71, 74, 76, 57];               /* D pentatonic, Pakistan lands low */
    MARKETS.forEach(function(m, i){ var x = 1.45 + i * .075; if(x > T) bell(scale[i] + 12, at(x), m.pk ? .14 : .08); });
    if(T < 2.9) whoosh(at(Math.max(1.7, T)), base + 2.75, base + 3.25);
    if(T < 2.75) thud(at(2.75));
    if(T < 3.62) chord(at(3.62));
    if(sndBtn) sndBtn.classList.add('on');
  }
  function endScore(early){
    if(!ac) return;
    if(bus){ var n = ac.currentTime; bus.gain.cancelScheduledValues(n); bus.gain.setValueAtTime(Math.max(bus.gain.value, .0001), n);
      bus.gain.exponentialRampToValueAtTime(0.0001, n + (early ? .45 : 4.2)); }
    setTimeout(function(){ try{ ac.close(); }catch(e){} }, early ? 900 : 5000);
  }
  if(AC){
    try{ ac = new AC(); }catch(e){ ac = null; }
    if(ac){
      var tryStart = function(){ if(ac.state === 'running') startScore(); };
      try{ var pr = ac.resume(); if(pr && pr.then) pr.then(tryStart, function(){}); }catch(e){}
      tryStart();
      /* blocked? offer it — until the flight is over */
      setTimeout(function(){ if(!scoreOn && !done && curT < 3.2 && sndBtn) sndBtn.classList.add('show'); }, 450);
      setTimeout(function(){ if(!scoreOn && sndBtn) sndBtn.classList.remove('show'); }, 3700);
      if(sndBtn) sndBtn.addEventListener('click', function(e){
        e.stopPropagation();
        ac.resume().then(startScore, function(){});
      });
    }
  }

  el.addEventListener('click', finish);
  addEventListener('keydown', function(e){ if(e.key === 'Escape') finish(); });

  raf = requestAnimationFrame(frame);
})();
