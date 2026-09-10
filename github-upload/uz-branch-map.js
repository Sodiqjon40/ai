// <uz-branch-map points='[{id,name,city,lat,lon,val,color}]' selected="b1">
// Real geometry: Natural Earth via world-atlas (pinned). Loads d3 + topojson itself,
// so it never races a host's script mount.
(function () {
  const LIBS = [
    { g: 'd3', src: 'https://unpkg.com/d3@7.9.0/dist/d3.min.js', integrity: 'sha384-CjloA8y00+1SDAUkjs099PVfnY2KmDC2BZnws9kh8D/lX1s46w6EPhpXdqMfjK6i' },
    { g: 'topojson', src: 'https://unpkg.com/topojson-client@3.1.0/dist/topojson-client.min.js', integrity: 'sha384-Ukv1p/xTma6P4/2bY5KzWBw+ydSpXmhCMtyciIQVDJ1RmOxtCYNMF1uXT9T63H67' },
  ];
  const TOPO = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';

  function load(l) {
    if (window[l.g]) return Promise.resolve();
    let p = document.querySelector('script[data-lib="' + l.g + '"]');
    if (!p) {
      p = document.createElement('script');
      p.src = l.src; p.integrity = l.integrity; p.crossOrigin = 'anonymous';
      p.setAttribute('data-lib', l.g);
      document.head.appendChild(p);
    }
    return new Promise((res, rej) => {
      if (window[l.g]) return res();
      p.addEventListener('load', res, { once: true });
      p.addEventListener('error', () => rej(new Error('lib ' + l.g)), { once: true });
    });
  }

  let geoP = null;
  function geo() {
    if (geoP) return geoP;
    geoP = LIBS.reduce((c, l) => c.then(() => load(l)), Promise.resolve())
      .then(() => fetch(TOPO))
      .then(r => r.json())
      .then(topo => {
        const all = window.topojson.feature(topo, topo.objects.countries).features;
        return { uz: all.filter(f => f.properties.name === 'Uzbekistan')[0], all: all };
      });
    return geoP;
  }

  class UzBranchMap extends HTMLElement {
    static get observedAttributes() { return ['points', 'selected']; }
    set points(v) { this.setAttribute('points', typeof v === 'string' ? v : JSON.stringify(v || [])); }
    get points() { return this.getAttribute('points'); }
    set selected(v) { this.setAttribute('selected', v == null ? '' : String(v)); }
    get selected() { return this.getAttribute('selected'); }
    connectedCallback() {
      this.style.display = 'block';
      this.style.position = 'relative';
      this._draw();
      if (!this._ro) {
        this._ro = new ResizeObserver(() => this._draw());
        this._ro.observe(this);
      }
    }
    disconnectedCallback() { if (this._ro) { this._ro.disconnect(); this._ro = null; } }
    attributeChangedCallback() { this._draw(); }

    _draw() {
      const w = this.clientWidth || 520;
      const h = this.clientHeight || 300;
      if (w < 40 || h < 40) return;
      const key = w + 'x' + h + '|' + (this.getAttribute('points') || '') + '|' + (this.getAttribute('selected') || '');
      if (key === this._key) return;
      this._key = key;

      let pts = [];
      try { pts = JSON.parse(this.getAttribute('points') || '[]'); } catch (e) { pts = []; }
      const selId = this.getAttribute('selected') || '';

      geo().then(({ uz, all }) => {
        if (this._key !== key) return;
        const d3 = window.d3;
        const proj = d3.geoMercator().fitExtent([[14, 16], [w - 14, h - 16]], uz);
        const path = d3.geoPath(proj);
        const max = Math.max.apply(null, pts.map(p => p.val).concat([1]));
        const r = (v) => 7 + Math.sqrt(v / max) * 15;

        const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
        const neigh = all.filter(f => f.properties.name !== 'Uzbekistan')
          .map(f => '<path d="' + (path(f) || '') + '" fill="#F1F4F7" stroke="#E4E9EE" stroke-width="1"/>').join('');

        const bubbles = pts.slice().sort((a, b) => b.val - a.val).map(p => {
          const c = proj([p.lon, p.lat]);
          if (!c) return '';
          const on = !selId || selId === p.id;
          const rad = r(p.val);
          return '<g opacity="' + (on ? 1 : 0.32) + '">'
            + (selId === p.id ? '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + (rad + 7) + '" fill="' + p.color + '" opacity="0.16"/>' : '')
            + '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + rad + '" fill="' + p.color + '" fill-opacity="0.82" stroke="#fff" stroke-width="2.2"/>'
            + '<title>' + esc(p.name + ' · ' + p.city) + '</title></g>';
        }).join('');

        const labels = pts.map(p => {
          const c = proj([p.lon, p.lat]);
          if (!c) return '';
          const on = !selId || selId === p.id;
          const rad = r(p.val);
          const right = c[0] < w * 0.62;
          const x = right ? c[0] + rad + 7 : c[0] - rad - 7;
          return '<text x="' + x + '" y="' + (c[1] + 4) + '" text-anchor="' + (right ? 'start' : 'end') + '"'
            + ' font-family="Manrope, system-ui, sans-serif" font-size="11.5" font-weight="800"'
            + ' fill="#16313A" opacity="' + (on ? 0.92 : 0.3) + '"'
            + ' stroke="#fff" stroke-width="3.4" paint-order="stroke">' + esc(p.city) + '</text>';
        }).join('');

        this.innerHTML = '<svg width="100%" height="100%" viewBox="0 0 ' + w + ' ' + h + '" style="display:block;">'
          + '<defs><clipPath id="uzclip"><rect x="0" y="0" width="' + w + '" height="' + h + '"/></clipPath></defs>'
          + '<g clip-path="url(#uzclip)">' + neigh + '</g>'
          + '<path d="' + (path(uz) || '') + '" fill="#E3F3F5" stroke="#9FD5DB" stroke-width="1.4"/>'
          + bubbles + labels
          + '</svg>';
      }).catch(() => {
        this.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;'
          + 'font-family:Manrope,system-ui,sans-serif;font-size:12.5px;font-weight:600;color:#9AA3AE;">Xarita yuklanmadi</div>';
      });
    }
  }
  if (!customElements.get('uz-branch-map')) customElements.define('uz-branch-map', UzBranchMap);
})();
