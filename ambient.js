/* =====================================================================
   FOTILE · AMBIENT — a small generative score engine, shared by pages.
   No audio files: every note is synthesised in the browser, so it costs
   nothing to download and never repeats exactly.

     FotileAmbient.mount({ theme:'moon' | 'opal' })

   Two presets:
     moon — deep, slow, interstellar. An organ-like drone that changes
            chord every ~22s, a sub swell, a quiet tick, rare high bells.
     opal — bright and glassy. A major pad, struck glass bells and the
            occasional falling water drop.

   Never autoplays (browsers block it, and nobody wants a page that
   shouts). A pill in the corner turns it on; the choice is remembered
   for the session. Pauses when the tab is hidden.
   ===================================================================== */
(function(){
  var AC = window.AudioContext || window.webkitAudioContext;

  var PRESETS = {
    moon: {
      label:'Moon Score', accent:'#e2b48c', ink:'#f3efe9', panel:'rgba(10,10,14,.62)',
      line:'rgba(255,255,255,.16)', vol:0.30, revLen:4.2, revMix:0.62,
      /* D minor family — each chord is a set of midi notes for the drone */
      chords:[[38,50,57,62,65],[34,46,53,58,62],[33,45,52,57,60],[36,48,55,60,64]],
      chordEvery:22, glide:7,
      scale:[74,77,79,81,84,86],            /* the rare high bells */
      bellEvery:[9,17], bellVel:0.055,
      tick:true, sub:true
    },
    opal: {
      label:'Opal Score', accent:'#2f8e8c', ink:'#14161b', panel:'rgba(255,255,255,.62)',
      line:'rgba(20,22,28,.14)', vol:0.26, revLen:2.6, revMix:0.5,
      /* D major family — open, bright, unresolved */
      chords:[[50,57,62,66,69],[52,59,64,68,71],[45,57,64,69,73],[50,57,64,66,71]],
      chordEvery:18, glide:5.5,
      scale:[74,76,78,81,83,86,88],
      bellEvery:[2.6,5.4], bellVel:0.085,
      tick:false, sub:false, drops:true
    }
  };

  function mtof(m){ return 440 * Math.pow(2, (m - 69) / 12); }
  function rnd(a,b){ return a + Math.random() * (b - a); }

  function mount(opt){
    var P = PRESETS[(opt && opt.theme) || 'moon'];
    if(!P || !AC) return;
    var KEY = 'fotile_amb_' + (opt.theme || 'moon');

    /* ---------- the pill ------------------------------------------- */
    var css = ''
    + '.fa-pill{position:fixed;right:92px;bottom:22px;z-index:900;display:flex;align-items:center;'
    +   'height:46px;padding:0;border:1px solid ' + P.line + ';border-radius:50px;cursor:pointer;'
    +   'background:' + P.panel + ';backdrop-filter:blur(14px) saturate(1.3);-webkit-backdrop-filter:blur(14px) saturate(1.3);'
    +   'box-shadow:0 14px 40px rgba(0,0,0,.30);color:' + P.ink + ';opacity:0;transform:translateY(14px);'
    +   'pointer-events:none;transition:opacity .6s,transform .6s cubic-bezier(.16,1,.3,1),background .4s,border-color .4s}'
    + '.fa-pill.ready{opacity:1;transform:none;pointer-events:auto}'
    + '.fa-pill:hover{transform:translateY(-2px);border-color:' + P.accent + '}'
    + '.fa-pill .fa-ic{width:44px;height:44px;flex:0 0 44px;display:grid;place-items:center}'
    + '.fa-pill .fa-ic svg{width:19px;height:19px;display:block}'
    + '.fa-pill .fa-eq{display:flex;align-items:flex-end;gap:2px;height:12px;max-width:0;overflow:hidden;opacity:0;'
    +   'transition:max-width .5s cubic-bezier(.16,1,.3,1),opacity .4s,margin .5s}'
    + '.fa-pill.on .fa-eq{max-width:22px;opacity:1;margin-right:14px}'
    + '.fa-pill .fa-eq i{display:block;width:2px;border-radius:2px;height:4px;background:' + P.accent + ';'
    +   'animation:faEq 1.15s ease-in-out infinite}'
    + '.fa-pill .fa-eq i:nth-child(2){animation-delay:.22s}.fa-pill .fa-eq i:nth-child(3){animation-delay:.44s}'
    + '@keyframes faEq{0%,100%{height:3px;opacity:.5}50%{height:12px;opacity:1}}'
    + '.fa-pill .fa-lb{font:700 10px/1 Manrope,system-ui,sans-serif;letter-spacing:2.4px;text-transform:uppercase;'
    +   'white-space:nowrap;max-width:0;overflow:hidden;opacity:0;transition:max-width .6s cubic-bezier(.16,1,.3,1),opacity .4s,padding .6s}'
    + '.fa-pill:hover .fa-lb,.fa-pill.hint .fa-lb{max-width:170px;opacity:1;padding-right:20px}'
    + '.fa-pill.on .fa-lb{color:' + P.accent + '}'
    + '@media(max-width:860px){.fa-pill{right:14px;bottom:78px;height:42px}'
    +   '.fa-pill .fa-ic{width:40px;height:40px;flex:0 0 40px}.fa-pill:hover .fa-lb{max-width:0;opacity:0;padding-right:0}'
    +   '.fa-pill.hint .fa-lb{max-width:150px;opacity:1;padding-right:16px}}'
    + '@media(prefers-reduced-motion:reduce){.fa-pill .fa-eq i{animation:none;height:7px}}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

    var btn = document.createElement('button');
    btn.className = 'fa-pill'; btn.type = 'button'; btn.setAttribute('aria-pressed','false');
    btn.setAttribute('aria-label','Play the ambient score for this page');
    btn.innerHTML =
      '<span class="fa-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" '
      + 'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'
      + '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>'
      + '</svg></span>'
      + '<span class="fa-eq" aria-hidden="true"><i></i><i></i><i></i></span>'
      + '<span class="fa-lb">' + P.label + '</span>';
    document.body.appendChild(btn);

    /* ---------- audio ---------------------------------------------- */
    var ac = null, master = null, bus = null, tone = null, on = false, voices = [], timers = [], chordIx = 0;

    function hall(len){
      var n = Math.floor(ac.sampleRate * len), b = ac.createBuffer(2, n, ac.sampleRate);
      for(var c = 0; c < 2; c++){
        var d = b.getChannelData(c);
        for(var i = 0; i < n; i++){ var t = i / n; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.5) * (1 - t * .3); }
      }
      return b;
    }
    function noiseBuf(sec){
      var n = Math.floor(ac.sampleRate * sec), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
      for(var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      return b;
    }

    function build(){
      ac = new AC();
      master = ac.createGain(); master.gain.value = 0.0001;
      var comp = ac.createDynamicsCompressor();
      comp.threshold.value = -20; comp.knee.value = 22; comp.ratio.value = 3.2;
      comp.attack.value = .02; comp.release.value = .5;
      master.connect(comp); comp.connect(ac.destination);

      tone = ac.createBiquadFilter(); tone.type = 'lowpass';
      tone.frequency.value = P.tick ? 1100 : 2400; tone.Q.value = .4;
      bus = ac.createGain(); bus.connect(tone);

      var wet = ac.createConvolver(); wet.buffer = hall(P.revLen);
      var wg = ac.createGain(); wg.gain.value = P.revMix;
      var dg = ac.createGain(); dg.gain.value = .62;
      tone.connect(dg); dg.connect(master);
      tone.connect(wet); wet.connect(wg); wg.connect(master);

      /* the drone — one voice per note of the chord, each a small organ */
      var chord = P.chords[0];
      chord.forEach(function(midi, i){
        var lvl = [.115, .085, .062, .05, .036][i] || .03;
        var o  = ac.createOscillator(), o2 = ac.createOscillator(), oh = ac.createOscillator();
        var g  = ac.createGain(), f = ac.createBiquadFilter(), gh = ac.createGain();
        o.type = 'sine'; o2.type = i < 2 ? 'sine' : 'triangle'; oh.type = 'sine';
        o.frequency.value = mtof(midi); o2.frequency.value = mtof(midi); oh.frequency.value = mtof(midi) * 2;
        o2.detune.value = i % 2 ? 6 : -6;
        f.type = 'lowpass'; f.frequency.value = P.tick ? 900 : 1600; f.Q.value = .3;
        gh.gain.value = P.tick ? .16 : .1;
        g.gain.value = 0;
        o.connect(f); o2.connect(f); oh.connect(gh); gh.connect(f); f.connect(g); g.connect(bus);
        /* a slow breath so it never sits still */
        var lfo = ac.createOscillator(), la = ac.createGain();
        lfo.frequency.value = .031 + i * .013; la.gain.value = lvl * .3;
        lfo.connect(la); la.connect(g.gain);
        o.start(); o2.start(); oh.start(); lfo.start();
        voices.push({ g:g, lvl:lvl, os:[o, o2], oh:oh, midi:midi });
      });
    }

    function bell(midi, when, vel, parts){
      var out = ac.createGain(), pan = ac.createStereoPanner ? ac.createStereoPanner() : null;
      if(pan){ pan.pan.value = rnd(-.6, .6); out.connect(pan); pan.connect(bus); } else out.connect(bus);
      var dur = P.tick ? rnd(5, 8) : rnd(3.4, 5.4);
      (parts || [[1,1],[2.01,.26],[2.76,.15],[4.07,.06]]).forEach(function(p){
        var o = ac.createOscillator(), g = ac.createGain();
        o.type = 'sine'; o.frequency.value = mtof(midi) * p[0]; o.detune.value = rnd(-4, 4);
        g.gain.setValueAtTime(0, when);
        g.gain.linearRampToValueAtTime(p[1] * vel, when + .012);
        g.gain.exponentialRampToValueAtTime(.0001, when + dur * (.45 + p[1] * .55));
        o.connect(g); g.connect(out); o.start(when); o.stop(when + dur + .2);
      });
      out.gain.setValueAtTime(1, when);
    }

    function drop(when){                       /* opal: a pitch falling into water */
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(rnd(900, 1500), when);
      o.frequency.exponentialRampToValueAtTime(rnd(220, 380), when + .28);
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(.05, when + .008);
      g.gain.exponentialRampToValueAtTime(.0001, when + .55);
      o.connect(g); g.connect(bus); o.start(when); o.stop(when + .7);
    }

    function tick(when){                        /* moon: a quiet marker of time */
      var s = ac.createBufferSource(); s.buffer = noiseBuf(.12);
      var f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2100; f.Q.value = 6;
      var g = ac.createGain();
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(.05, when + .004);
      g.gain.exponentialRampToValueAtTime(.0001, when + .16);
      s.connect(f); f.connect(g); g.connect(bus); s.start(when); s.stop(when + .2);
    }

    function subSwell(when){
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = mtof(P.chords[chordIx][0] - 12);
      g.gain.setValueAtTime(.0001, when);
      g.gain.exponentialRampToValueAtTime(.09, when + 2.2);
      g.gain.exponentialRampToValueAtTime(.0001, when + 7);
      o.connect(g); g.connect(bus); o.start(when); o.stop(when + 7.4);
    }

    function nextChord(){
      chordIx = (chordIx + 1) % P.chords.length;
      var c = P.chords[chordIx], t = ac.currentTime, k = P.glide / 3;
      voices.forEach(function(v, i){
        var m = c[i]; if(m == null) return;
        v.os.forEach(function(o){ o.frequency.setTargetAtTime(mtof(m), t, k); });
        v.oh.frequency.setTargetAtTime(mtof(m) * 2, t, k);
      });
      if(P.sub) subSwell(t + 1.2);
    }

    /* the loops */
    function loopBells(){
      if(!on) return;
      var m = P.scale[Math.floor(Math.random() * P.scale.length)];
      bell(m, ac.currentTime + .05, rnd(.7, 1) * P.bellVel,
           P.tick ? null : [[1,1],[2.76,.3],[5.4,.12]]);
      if(!P.tick && Math.random() < .35) bell(m + (Math.random() < .5 ? 7 : -5), ac.currentTime + rnd(.9, 1.6), P.bellVel * .5, [[1,1],[2.76,.28]]);
      timers.push(setTimeout(loopBells, rnd(P.bellEvery[0], P.bellEvery[1]) * 1000));
    }
    function loopTick(){
      if(!on) return;
      tick(ac.currentTime + .03);
      timers.push(setTimeout(loopTick, rnd(1.35, 1.75) * 1000));
    }
    function loopDrops(){
      if(!on) return;
      drop(ac.currentTime + .03);
      timers.push(setTimeout(loopDrops, rnd(4, 9) * 1000));
    }
    function loopChord(){
      if(!on) return;
      nextChord();
      timers.push(setTimeout(loopChord, P.chordEvery * 1000));
    }

    function start(){
      if(!ac) build();
      if(ac.state === 'suspended') ac.resume();
      on = true;
      var t = ac.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(Math.max(master.gain.value, .0001), t);
      master.gain.linearRampToValueAtTime(P.vol, t + 4.5);
      voices.forEach(function(v){ v.g.gain.setTargetAtTime(v.lvl, t, 3.2); });
      if(P.sub) subSwell(t + 1.5);
      loopBells(); loopChord();
      if(P.tick) loopTick();
      if(P.drops) loopDrops();
      btn.classList.add('on'); btn.setAttribute('aria-pressed','true');
      try{ sessionStorage.setItem(KEY,'1'); }catch(e){}
    }
    function stop(){
      on = false;
      timers.forEach(clearTimeout); timers = [];
      if(ac){
        var t = ac.currentTime;
        master.gain.cancelScheduledValues(t);
        master.gain.setValueAtTime(Math.max(master.gain.value, .0001), t);
        master.gain.linearRampToValueAtTime(.0001, t + 1.6);
        voices.forEach(function(v){ v.g.gain.setTargetAtTime(0, t, .6); });
      }
      btn.classList.remove('on'); btn.setAttribute('aria-pressed','false');
      try{ sessionStorage.setItem(KEY,'0'); }catch(e){}
    }
    btn.addEventListener('click', function(){ on ? stop() : start(); });

    addEventListener('visibilitychange', function(){
      if(!ac || !on) return;
      if(document.hidden) ac.suspend(); else ac.resume();
    });

    /* show the pill once the page has settled, and nudge it once */
    setTimeout(function(){
      btn.classList.add('ready');
      var was = null; try{ was = sessionStorage.getItem(KEY); }catch(e){}
      if(was !== '0'){ btn.classList.add('hint'); setTimeout(function(){ btn.classList.remove('hint'); }, 4200); }
    }, (opt && opt.delay) || 3200);
  }

  window.FotileAmbient = { mount: mount };
})();
