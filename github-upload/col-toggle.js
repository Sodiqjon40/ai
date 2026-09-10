(function () {
  // Generic column show/hide for any grid-based table.
  // Markup contract (add to a table card):
  //   <div data-coltable="uniqueId"> ... </div>      (card wrapper)
  //     - one header row:  <div data-colhead style="display:grid; grid-template-columns:...">
  //     - body rows:       <div data-colrow  style="display:grid; grid-template-columns:...">
  //   The settings gear is injected at the right end of the header row.
  //   Columns whose header cell text is empty are treated as fixed (always shown).

  var LS = 'wasytCols:';
  var LANG = (function () { try { return localStorage.getItem('wasyt_lang') || 'uz'; } catch (e) { return 'uz'; } })();
  var T = {
    title: LANG === 'ru' ? '\u041f\u043e\u043b\u044f \u0442\u0430\u0431\u043b\u0438\u0446\u044b' : 'Jadval ustunlari',
    apply: LANG === 'ru' ? '\u041f\u0440\u0438\u043c\u0435\u043d\u0438\u0442\u044c' : "Qo'llash"
  };

  function loadVis(id) { try { return JSON.parse(localStorage.getItem(LS + id) || '{}'); } catch (e) { return {}; } }
  function saveVis(id, m) { try { localStorage.setItem(LS + id, JSON.stringify(m)); } catch (e) {} }

  // children of a row, excluding the injected gear button
  function cells(row) {
    return [].filter.call(row.children, function (c) {
      return !(c.classList && c.classList.contains('colgear'));
    });
  }

  function tracksOf(head) {
    var orig = head.getAttribute('data-coltracks');
    if (!orig) {
      orig = (head.style.gridTemplateColumns || '').trim();
      if (!orig) return null;
      head.setAttribute('data-coltracks', orig);
    }
    return orig.split(/\s+/);
  }

  function labels(head) {
    return cells(head).map(function (c) { return (c.textContent || '').replace(/\s+/g, ' ').trim(); });
  }

  function applyTable(card) {
    var id = card.getAttribute('data-coltable');
    var head = card.querySelector('[data-colhead]');
    if (!head) return;
    var tracks = tracksOf(head);
    var hc = cells(head);
    if (!tracks || tracks.length !== hc.length) return;
    var vis = loadVis(id);
    var tmpl = tracks.filter(function (_, i) { return vis[i] !== false; }).join(' ');
    function paint(row) {
      var cs = cells(row);
      if (cs.length !== tracks.length) return;
      row.style.gridTemplateColumns = tmpl;
      cs.forEach(function (c, i) {
        if (!c.hasAttribute('data-coldisp')) c.setAttribute('data-coldisp', c.style.display || '');
        c.style.display = (vis[i] === false) ? 'none' : c.getAttribute('data-coldisp');
      });
    }
    paint(head);
    [].forEach.call(card.querySelectorAll('[data-colrow]'), paint);
  }

  function applyAll() { [].forEach.call(document.querySelectorAll('[data-coltable]'), applyTable); }

  // --- panel ---
  var panel = null;
  function buildPanel() {
    if (panel) return panel;
    panel = document.createElement('div');
    panel.id = '__colpanel';
    panel.style.cssText = 'position:fixed; z-index:9998; width:288px; background:#fff; border:1px solid #EDEFF2; border-radius:16px; box-shadow:0 16px 40px rgba(16,24,40,0.18); padding:14px; display:none; font-family:inherit; text-align:left;';
    document.body.appendChild(panel);
    document.addEventListener('click', function (e) {
      if (panel.style.display === 'none') return;
      if (panel.contains(e.target)) return;
      if (e.target.closest && e.target.closest('.colgear')) return;
      panel.style.display = 'none';
    });
    return panel;
  }
  function esc(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function openPanel(card, gear) {
    var id = card.getAttribute('data-coltable');
    var head = card.querySelector('[data-colhead]');
    if (!head) return;
    tracksOf(head);
    var labs = labels(head);
    var vis = loadVis(id);
    var p = buildPanel();
    var rows = labs.map(function (lab, i) {
      if (!lab) return '';
      var on = vis[i] !== false;
      return '<button data-i="' + i + '" style="display:flex;align-items:center;gap:11px;width:100%;background:#F7F9FA;border:none;border-radius:11px;padding:11px 13px;cursor:pointer;text-align:left;">'
        + '<span style="width:22px;height:22px;border-radius:6px;flex-shrink:0;display:flex;align-items:center;justify-content:center;' + (on ? 'background:#14A0AE;' : 'background:#fff;border:2px solid #CBD3DA;') + '">'
        + (on ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>' : '') + '</span>'
        + '<span style="font-size:13.5px;font-weight:700;color:#16313A;">' + esc(lab) + '</span></button>';
    }).join('');
    p.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">'
      + '<span style="font-size:14.5px;font-weight:800;color:#16313A;">' + T.title + '</span>'
      + '<button id="__colapply" style="background:#14A0AE;color:#fff;border:none;border-radius:9px;padding:7px 16px;font-size:13px;font-weight:700;cursor:pointer;">' + T.apply + '</button></div>'
      + '<div style="display:flex;flex-direction:column;gap:6px;max-height:340px;overflow-y:auto;">' + rows + '</div>';
    p.style.display = 'block';
    var r = gear.getBoundingClientRect();
    var top = r.bottom + 8, left = r.right - 288;
    if (left < 8) left = 8;
    if (top + p.offsetHeight > window.innerHeight - 8) top = Math.max(8, r.top - 8 - p.offsetHeight);
    p.style.top = top + 'px';
    p.style.left = left + 'px';
    p.querySelector('#__colapply').onclick = function () { p.style.display = 'none'; };
    [].forEach.call(p.querySelectorAll('button[data-i]'), function (b) {
      b.onclick = function () {
        var i = +b.getAttribute('data-i');
        var m = loadVis(id);
        m[i] = (m[i] === false) ? true : false;
        saveVis(id, m);
        applyTable(card);
        openPanel(card, gear); // re-render checkboxes in place
      };
    });
  }

  function gearSvg() {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14A0AE" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>';
  }

  // inject the gear into the right end of each table's header row
  function ensureGears() {
    [].forEach.call(document.querySelectorAll('[data-coltable]'), function (card) {
      if (card.offsetParent === null) return; // hidden tab/screen
      var head = card.querySelector('[data-colhead]');
      if (!head) return;
      if (getComputedStyle(head).position === 'static') head.style.position = 'relative';
      var gear = [].filter.call(head.children, function (c) { return c.classList && c.classList.contains('colgear'); })[0];
      if (!gear) {
        gear = document.createElement('button');
        gear.className = 'colgear';
        gear.type = 'button';
        gear.title = T.title;
        gear.style.cssText = 'position:absolute; top:50%; right:12px; transform:translateY(-50%); width:28px; height:28px; border-radius:8px; border:1px solid #E5E9ED; background:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; padding:0; z-index:4;';
        gear.innerHTML = gearSvg();
        head.appendChild(gear);
      }
      // if the last column has a visible label, reserve room so the gear doesn't overlap its text
      var labs = labels(head);
      if (labs.length && labs[labs.length - 1]) {
        var hc = cells(head);
        var lastH = hc[hc.length - 1];
        if (lastH && lastH.getAttribute('data-colgearpad') !== '1') { lastH.style.paddingRight = '34px'; lastH.setAttribute('data-colgearpad', '1'); }
        [].forEach.call(card.querySelectorAll('[data-colrow]'), function (r) {
          var cs = cells(r); var lc = cs[cs.length - 1];
          if (lc && lc.getAttribute('data-colgearpad') !== '1') { lc.style.paddingRight = '34px'; lc.setAttribute('data-colgearpad', '1'); }
        });
      }
      gear.__card = card;
    });
  }

  document.addEventListener('click', function (e) {
    var g = e.target.closest && e.target.closest('.colgear');
    if (!g || !g.__card) return;
    e.stopPropagation();
    var p = buildPanel();
    if (p.style.display === 'block' && p.__card === g.__card) { p.style.display = 'none'; return; }
    p.__card = g.__card;
    openPanel(g.__card, g);
  });

  // remove any legacy floating gear bars from earlier versions
  function pruneBars() {
    [].forEach.call(document.querySelectorAll('.colgearbar'), function (bar) {
      bar.parentNode && bar.parentNode.removeChild(bar);
    });
  }

  var _busy = false, _pend = 0, _mo = null;
  function tick() {
    if (_busy) return;
    _busy = true;
    if (_mo) _mo.disconnect();
    try { pruneBars(); ensureGears(); applyAll(); } catch (e) {}
    if (_mo) _mo.observe(document.documentElement, { childList: true, subtree: true });
    _busy = false;
  }
  function schedule() {
    if (_pend) return;
    _pend = setTimeout(function () { _pend = 0; tick(); }, 120);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  tick();
  _mo = new MutationObserver(schedule);
  _mo.observe(document.documentElement, { childList: true, subtree: true });
})();
