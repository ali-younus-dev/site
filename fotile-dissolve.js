/* ============================================================================
   FOTILE — DISSOLVE
   The brand film's signature transition, as a reusable web effect.

   In the film (26.7s -> 28.0s) a solid hood mechanism disintegrates into a
   field of white points, the frame flashes to an inverted white, and the parts
   reassemble as an engineering drawing. This reproduces that: a product image
   is sampled into a point cloud that scatters when it is off-screen and
   converges into the real object as it scrolls into view, with the same white
   flash at the moment it locks.

   USAGE
     <div class="fd" data-dissolve="assets/products/range-island-hood-ea06.png"></div>
     <script src="fotile-dissolve.js"></script>

   OPTIONS (data- attributes)
     data-dissolve      image path, ROOT-RELATIVE (window.__PBASE is applied)
     data-density       pixel step when sampling; lower = more particles (default 4)
     data-flash         "0" to disable the white invert flash
     data-hold          "1" keeps it assembled once seen (no re-scatter)

   NOTES
     - Draws through a single ImageData buffer, not thousands of fillRect calls.
     - Runs only while on screen; pauses otherwise. Honours prefers-reduced-motion
       by rendering the assembled image immediately with no animation.
     - No blend modes, no filters, no background-attachment: the Opal page went
       to 3 fps on those. This stays on one canvas and one typed array.
   ========================================================================= */
(function () {
  'use strict';

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PBASE = window.__PBASE || '';

  function src(u) {
    if (/^(https?:)?\/\//.test(u) || /^data:/.test(u)) return u;
    return PBASE + String(u).replace(/^\/+/, '').replace(/^(\.\/)+/, '').replace(/^(\.\.\/)+/, '');
  }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function Dissolve(host) {
    var self = this;
    this.host = host;
    this.density = Math.max(2, parseInt(host.dataset.density || '4', 10));
    this.flashOn = host.dataset.flash !== '0';
    this.hold = host.dataset.hold === '1';
    this.progress = 0;        // 0 = fully scattered, 1 = fully assembled
    this.target = 0;
    this.flash = 0;
    this.running = false;
    this.ready = false;
    this.seen = false;

    this.cv = document.createElement('canvas');
    this.cv.className = 'fd-canvas';
    this.cv.setAttribute('aria-hidden', 'true');
    host.appendChild(this.cv);
    this.ctx = this.cv.getContext('2d', { alpha: true });

    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () { self.sample(img); };
    img.onerror = function () { host.classList.add('fd-failed'); };
    img.src = src(host.dataset.dissolve);

    // an accessible, indexable copy of the image for anyone who can't see the canvas
    if (host.dataset.alt) {
      var a = document.createElement('img');
      a.src = src(host.dataset.dissolve);
      a.alt = host.dataset.alt;
      a.className = 'fd-a11y';
      host.appendChild(a);
    }

    this.onResize = function () { self.layout(); };
    window.addEventListener('resize', this.onResize, { passive: true });
  }

  /* ---- turn the image into particles -------------------------------------- */
  Dissolve.prototype.sample = function (img) {
    // clientWidth, not getBoundingClientRect(): the host may carry a border,
    // and sizing the canvas to the border box overflows it by the border width.
    var W = Math.max(1, this.host.clientWidth);
    var H = Math.max(1, this.host.clientHeight || Math.round(W * (img.height / img.width)));

    // fit the image inside the host, preserving aspect
    var s = Math.min(W / img.width, H / img.height);
    var dw = Math.round(img.width * s), dh = Math.round(img.height * s);
    var ox = Math.round((W - dw) / 2), oy = Math.round((H - dh) / 2);

    var off = document.createElement('canvas');
    off.width = dw; off.height = dh;
    var octx = off.getContext('2d', { willReadFrequently: true });
    octx.drawImage(img, 0, 0, dw, dh);
    var data = octx.getImageData(0, 0, dw, dh).data;

    // the real bitmap, kept at device resolution — the particles hand over to
    // this at the end, so the block finishes as the photograph, not as dots
    this.solid = img;
    this.ox = ox; this.oy = oy; this.dw = dw; this.dh = dh;

    var step = this.density;
    var xs = [], ys = [], cr = [], cg = [], cb = [], ca = [], sx = [], sy = [], dl = [];
    var cx = dw / 2, cy = dh / 2;
    var maxR = Math.sqrt(cx * cx + cy * cy);

    for (var y = 0; y < dh; y += step) {
      for (var x = 0; x < dw; x += step) {
        var i = (y * dw + x) * 4;
        var a = data[i + 3];
        if (a < 24) continue;                       // transparent -> no particle
        var r = data[i], g = data[i + 1], b = data[i + 2];
        if (a > 200 && r < 14 && g < 14 && b < 14) continue;  // pure black -> skip

        xs.push(x + ox); ys.push(y + oy);
        cr.push(r); cg.push(g); cb.push(b); ca.push(a);

        // scattered origin: pushed out along its own radius, with jitter
        var ang = Math.atan2(y - cy, x - cx) + (Math.random() - 0.5) * 1.5;
        var dist = (0.55 + Math.random() * 1.5) * maxR;
        sx.push(cx + Math.cos(ang) * dist + ox);
        sy.push(cy + Math.sin(ang) * dist * 0.7 + oy);

        // particles nearer the centre land first -> the object builds outward
        var rad = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)) / maxR;
        dl.push(rad * 0.45 + Math.random() * 0.2);
      }
    }

    this.n = xs.length;
    this.xs = new Float32Array(xs); this.ys = new Float32Array(ys);
    this.sx = new Float32Array(sx); this.sy = new Float32Array(sy);
    this.dl = new Float32Array(dl);
    this.cr = new Uint8Array(cr); this.cg = new Uint8Array(cg);
    this.cb = new Uint8Array(cb); this.ca = new Uint8Array(ca);
    this.W = W; this.H = H;
    this.ready = true;
    this.layout();
    this.observe();
    if (REDUCED) { this.progress = this.target = 1; this.draw(); }
  };

  Dissolve.prototype.layout = function () {
    if (!this.ready) return;
    var cw = this.host.clientWidth;
    if (cw && Math.abs(cw - this.W) > 1) { this.W = cw; this.H = this.host.clientHeight || this.H; }
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.cv.width = Math.round(this.W * dpr);
    this.cv.height = Math.round(this.H * dpr);
    this.cv.style.width = this.W + 'px';
    this.cv.style.height = this.H + 'px';
    this.dpr = dpr;
    this.buf = this.ctx.createImageData(this.cv.width, this.cv.height);
    this.draw();
  };

  /* ---- scroll wiring ------------------------------------------------------ */
  Dissolve.prototype.observe = function () {
    var self = this;
    if (!('IntersectionObserver' in window)) { this.target = 1; this.start(); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          if (!self.seen) { self.seen = true; self.flash = self.flashOn ? 1 : 0; }
          self.target = 1; self.start();
        } else if (!self.hold) {
          self.target = 0; self.start();
        }
      });
    }, { threshold: 0.35, rootMargin: '-8% 0px -8% 0px' });
    io.observe(this.host);
  };

  Dissolve.prototype.start = function () {
    if (this.running || REDUCED) return;
    this.running = true;
    var self = this, last = performance.now();
    (function loop(now) {
      var dt = Math.min(64, now - last) / 1000; last = now;
      var d = self.target - self.progress;
      self.progress += d * Math.min(1, dt * (self.target > self.progress ? 1.9 : 3.2));
      if (self.flash > 0) self.flash = Math.max(0, self.flash - dt * 1.6);
      self.draw();
      if (Math.abs(self.target - self.progress) < 0.002 && self.flash <= 0) {
        self.progress = self.target; self.draw(); self.running = false; return;
      }
      requestAnimationFrame(loop);
    })(last);
  };

  /* ---- render ------------------------------------------------------------- */
  Dissolve.prototype.draw = function () {
    if (!this.ready || !this.buf) return;
    var d = this.buf.data, w = this.cv.width, h = this.cv.height, dpr = this.dpr;
    d.fill(0);

    var p = this.progress;
    // the white flash peaks as the object locks together
    var fl = this.flash * Math.max(0, Math.min(1, (p - 0.55) / 0.3));
    // past 0.78 the point cloud hands over to the real photograph
    var solid = Math.max(0, Math.min(1, (p - 0.78) / 0.22));
    solid = solid * solid * (3 - 2 * solid);
    var pAlpha = 1 - solid;

    for (var i = 0; i < this.n; i++) {
      // each particle has its own delay, so the form builds from the centre out
      var t = (p - this.dl[i]) / (1 - this.dl[i]);
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      var e = easeOutCubic(t);

      var x = this.sx[i] + (this.xs[i] - this.sx[i]) * e;
      var y = this.sy[i] + (this.ys[i] - this.sy[i]) * e;

      var px = (x * dpr) | 0, py = (y * dpr) | 0;
      if (px < 0 || py < 0 || px >= w || py >= h) continue;

      // scattered particles read as cold white sparks; they take on the
      // product's real colour only as they arrive
      var a = this.ca[i] * (0.62 + 0.38 * e) * pAlpha;
      if (a < 2) continue;
      var r = this.cr[i] + (255 - this.cr[i]) * (1 - e) * 0.9;
      var g = this.cg[i] + (255 - this.cg[i]) * (1 - e) * 0.9;
      var b = this.cb[i] + (255 - this.cb[i]) * (1 - e) * 0.9;

      if (fl > 0) { r += (255 - r) * fl; g += (255 - g) * fl; b += (255 - b) * fl; }

      var o = (py * w + px) * 4;
      // additive so overlapping points bloom, like the film's point cloud
      d[o]     = Math.min(255, d[o]     + r);
      d[o + 1] = Math.min(255, d[o + 1] + g);
      d[o + 2] = Math.min(255, d[o + 2] + b);
      d[o + 3] = Math.min(255, d[o + 3] + a);

      // give each point a little body so the cloud reads as light, not dust
      if (px + 1 < w) {
        var o2 = o + 4;
        d[o2] = Math.min(255, d[o2] + r * .5); d[o2 + 1] = Math.min(255, d[o2 + 1] + g * .5);
        d[o2 + 2] = Math.min(255, d[o2 + 2] + b * .5); d[o2 + 3] = Math.min(255, d[o2 + 3] + a * .6);
      }
      if (py + 1 < h) {
        var o3 = ((py + 1) * w + px) * 4;
        d[o3] = Math.min(255, d[o3] + r * .5); d[o3 + 1] = Math.min(255, d[o3 + 1] + g * .5);
        d[o3 + 2] = Math.min(255, d[o3 + 2] + b * .5); d[o3 + 3] = Math.min(255, d[o3 + 3] + a * .6);
      }
    }
    this.ctx.putImageData(this.buf, 0, 0);

    // hand over to the real photograph
    if (solid > 0) {
      this.ctx.save();
      this.ctx.globalAlpha = solid;
      this.ctx.drawImage(this.solid, this.ox * dpr, this.oy * dpr, this.dw * dpr, this.dh * dpr);
      if (fl > 0) {
        this.ctx.globalAlpha = solid * fl * 0.9;
        this.ctx.globalCompositeOperation = 'lighter';
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(this.ox * dpr, this.oy * dpr, this.dw * dpr, this.dh * dpr);
      }
      this.ctx.restore();
    }
  };

  /* ---- boot --------------------------------------------------------------- */
  function boot() {
    var css = document.createElement('style');
    css.textContent =
      '.fd{position:relative;display:block}' +
      '.fd-canvas{display:block;width:100%;height:100%}' +
      '.fd-a11y{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}' +
      '.fd-failed{background:#0b0b0d}';
    document.head.appendChild(css);

    var nodes = document.querySelectorAll('[data-dissolve]');
    for (var i = 0; i < nodes.length; i++) new Dissolve(nodes[i]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.FotileDissolve = { Dissolve: Dissolve, boot: boot };
})();
