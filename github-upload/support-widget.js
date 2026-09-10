// WASYT — Texnik yordam vidjeti (sidebar pastidagi "Call Center" blokini bosiladigan yordam tugmasiga aylantiradi)
// Barcha sahifalarda ishlaydi: MutationObserver navbar footer'ini kutadi.
(function () {
  if (window.__wzSupportInit) return;
  window.__wzSupportInit = true;

  var PHONE = '+998 (55) 055-51-00';
  function TR(s) { try { return (window.WasytI18n && window.WasytI18n.t) ? window.WasytI18n.t(s) : s; } catch (e) { return s; } }

  // collapsed-nav uchun stil
  var st = document.createElement('style');
  st.textContent =
    'html.nav-collapsed .wz-support .wz-btn { width:46px; height:46px; padding:0; border-radius:50%; margin:0 auto; }' +
    'html.nav-collapsed .wz-support .wz-btn span:last-child { display:none; }' +
    'html.nav-collapsed .wz-support { display:flex; flex-direction:column; align-items:center; }';
  document.head.appendChild(st);

  function findFooter() {
    var els = document.querySelectorAll('aside div');
    for (var i = 0; i < els.length; i++) {
      var t = els[i];
      if (t.childElementCount === 0 && /Call Center|Колл-центр/.test(t.textContent)) {
        // t = label div; its parent row is what we replace
        var row = t.parentElement && t.parentElement.parentElement;
        if (row) return row;
      }
    }
    return null;
  }

  function h(tag, style, html) {
    var el = document.createElement(tag);
    if (style) el.setAttribute('style', style);
    if (html != null) el.innerHTML = html;
    return el;
  }

  var ICONS = {
    send: '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M3.4 20.4 20.8 12 3.4 3.6l.01 6.4L15 12 3.41 14Z"/></svg>',
    smile: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0"/><path d="M9 10h.01M15 10h.01" stroke-width="2.4" stroke-linecap="round"/></svg>',
    clip: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m21 12-8.5 8.5a5 5 0 0 1-7-7L14 5a3.3 3.3 0 0 1 4.7 4.7L10.4 18a1.65 1.65 0 0 1-2.3-2.3L16 8"/></svg>',
    avaBox: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#14A0AE" stroke-width="1.8"><path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>',
    avaHead: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#14A0AE" stroke-width="1.8"><path d="M4 13a8 8 0 0 1 16 0"/><rect x="3" y="12" width="4" height="6" rx="2" fill="#14A0AE" stroke="none"/><rect x="17" y="12" width="4" height="6" rx="2" fill="#14A0AE" stroke="none"/><path d="M17 18v1a2.5 2.5 0 0 1-2.5 2.5H13"/></svg>',
    avaCard: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#14A0AE" stroke-width="1.8"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 9.5h19M6 15h5"/></svg>',    tg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="#2AABEE"><path d="M21.5 3 2.5 10.5c-1 .4-1 1.9.1 2.2l4.9 1.5 1.9 5.7c.3 1 1.6 1.2 2.2.4l2.6-3.4 4.9 3.6c.9.6 2.1.1 2.3-.9l3-16.2c.2-1-.8-1.8-1.9-1.4Z"/></svg>',
    wa: '<svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.4 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.1-4.7-4-4.9-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.2 2.4 1.5 2.7 1.7.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2 .9c.3.2.5.2.6.4 0 .1 0 .7-.1 1.3Z"/></svg>',
    chat: '<svg width="16" height="16" viewBox="0 0 24 24" fill="#14A0AE"><path d="M12 3C6.5 3 2 6.6 2 11c0 2.2 1.1 4.2 2.9 5.6-.1.9-.5 2.3-1.6 3.4 0 0 2.6-.2 4.5-1.6 1.3.4 2.7.6 4.2.6 5.5 0 10-3.6 10-8S17.5 3 12 3Z"/></svg>',
    phone: '<svg width="16" height="16" viewBox="0 0 24 24" fill="#EC8A3C"><path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11.4 11.4 0 0 0 3.5.56 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .56 3.5 1 1 0 0 1-.24 1Z"/></svg>',
    life: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13a8 8 0 0 1 16 0"/><path d="M4 13v3a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2Z" fill="currentColor" stroke="none"/><path d="M20 13v3a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2Z" fill="currentColor" stroke="none"/><path d="M17 18v1a2.5 2.5 0 0 1-2.5 2.5H13"/></svg>'
  };

  // ===== Onlayn-chat oynasi =====
  var chatEl = null;
  function openChat(anchor) {
    if (chatEl) { chatEl.remove(); chatEl = null; return; }
    var TEAL = '#14A0AE', DARK = '#16313A';
    chatEl = h('div', 'position:fixed; z-index:10000; width:360px; max-width:calc(100vw - 32px); height:560px; max-height:calc(100vh - 32px); display:flex; flex-direction:column; background:#fff; border-radius:18px; box-shadow:0 24px 64px rgba(16,24,40,0.32); overflow:hidden; font-family:inherit;');
    var r = anchor ? anchor.getBoundingClientRect() : { right: 88, bottom: window.innerHeight - 16 };
    var left = Math.min(r.right + 14, window.innerWidth - 376);
    chatEl.style.left = Math.max(12, left) + 'px';
    chatEl.style.bottom = '16px';

    // header
    var head = h('div', 'background:linear-gradient(135deg, ' + DARK + ' 0%, #0E4A54 60%, ' + TEAL + ' 130%); color:#fff; padding:22px 20px 20px; position:relative; flex-shrink:0; text-align:center;');
    function ava(icon, name) {
      return '<div style="display:flex; flex-direction:column; align-items:center; gap:8px; width:88px;">' +
        '<span style="width:58px; height:58px; border-radius:50%; background:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 14px rgba(0,0,0,0.25);">' + icon + '</span>' +
        '<span style="font-size:12px; font-weight:600; color:rgba(255,255,255,0.92); line-height:1.35;">' + name + '</span></div>';
    }
    head.innerHTML =
      '<button class="wz-chat-x" style="position:absolute; top:12px; right:12px; width:30px; height:30px; border:none; border-radius:50%; background:rgba(255,255,255,0.14); color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
      '<div style="font-size:16.5px; font-weight:800;">WASYT yordam jamoasi</div>' +
      '<div style="font-size:12.5px; font-weight:600; color:rgba(255,255,255,0.65); margin-top:3px; display:flex; align-items:center; justify-content:center; gap:6px;"><span style="width:7px;height:7px;border-radius:50%;background:#3ED3C4;display:inline-block;"></span>Onlayn</div>' +
      '<div style="display:flex; justify-content:center; gap:10px; margin-top:16px;">' +
        ava(ICONS.avaBox, 'Mahsulot eksperti') + ava(ICONS.avaHead, 'Texnik yordam') + ava(ICONS.avaCard, 'Kassa mutaxassisi') +
      '</div>';

    // messages
    var body = h('div', 'flex:1; overflow-y:auto; padding:16px 14px; display:flex; flex-direction:column; gap:8px; background:#F7F9FA;');
    function bubble(text, mine) {
      var b = h('div', mine
        ? 'align-self:flex-end; max-width:78%; background:' + TEAL + '; color:#fff; border-radius:14px 14px 4px 14px; padding:10px 13px; font-size:13.5px; font-weight:500; line-height:1.5;'
        : 'align-self:flex-start; max-width:78%; background:#fff; color:' + DARK + '; border:1px solid #EDEFF2; border-radius:14px 14px 14px 4px; padding:10px 13px; font-size:13.5px; font-weight:500; line-height:1.5; box-shadow:0 1px 2px rgba(16,24,40,0.05);');
      b.textContent = text;
      body.appendChild(b);
      body.scrollTop = body.scrollHeight;
      return b;
    }
    bubble(TR("Assalomu alaykum! Bizga xabar yozing \u2014 tez orada javob beramiz."), false);

    // input
    var foot = h('div', 'flex-shrink:0; border-top:1px solid #EDEFF2; background:#fff; padding:10px 12px; display:flex; align-items:center; gap:8px;');
    var inp = h('input', 'flex:1; border:none; outline:none; font-family:inherit; font-size:14px; color:' + DARK + '; padding:8px 4px; background:transparent;');
    inp.placeholder = 'Xabaringizni yozing...';
    var ic1 = h('button', 'border:none; background:transparent; color:#9AA3AE; cursor:pointer; display:flex; padding:4px;', ICONS.smile);
    var ic2 = h('button', 'border:none; background:transparent; color:#9AA3AE; cursor:pointer; display:flex; padding:4px;', ICONS.clip);
    var send = h('button', 'width:38px; height:38px; border:none; border-radius:50%; background:' + TEAL + '; color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0;', ICONS.send);
    function doSend() {
      var v = inp.value.trim();
      if (!v) return;
      bubble(v, true);
      inp.value = '';
      setTimeout(function () {
        if (chatEl) bubble(TR('Rahmat! Operatorlarimiz bir necha daqiqada javob berishadi.'), false);
      }, 900);
    }
    send.onclick = doSend;
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') doSend(); });

    foot.appendChild(ic1); foot.appendChild(inp); foot.appendChild(ic2); foot.appendChild(send);
    chatEl.appendChild(head); chatEl.appendChild(body); chatEl.appendChild(foot);
    document.body.appendChild(chatEl);
    head.querySelector('.wz-chat-x').onclick = function () { chatEl.remove(); chatEl = null; };
    setTimeout(function () { inp.focus(); }, 50);
  }

  function build(row) {
    var wrap = h('div', 'position:relative; margin-top:8px; border-top:1px solid #EEF1F4; padding:12px 2px 2px;');
    wrap.className = 'wz-support';

    // options panel (hidden by default)
    var panel = h('div', 'display:none; flex-direction:column; gap:7px; padding-bottom:10px;');
    panel.className = 'wz-panel';
    function opt(icon, label, href) {
      var a = h('a', 'display:flex; align-items:center; gap:11px; background:#F4F6F8; border-radius:24px; padding:11px 16px; text-decoration:none; cursor:pointer;');
      a.innerHTML = '<span style="width:26px;height:26px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 1px 3px rgba(16,24,40,0.12);">' + icon + '</span>' +
        '<span style="font-size:13.5px;font-weight:700;color:#46535F;">' + label + '</span>';
      if (href) { a.href = href; a.target = '_blank'; a.rel = 'noopener'; }
      a.onmouseenter = function () { a.style.background = '#ECF0F3'; };
      a.onmouseleave = function () { a.style.background = '#F4F6F8'; };
      return a;
    }
    panel.appendChild(opt(ICONS.tg, 'Telegram', 'https://t.me/wasyt_support'));
    panel.appendChild(opt(ICONS.wa, 'WhatsApp', 'https://wa.me/998550555100'));
    var chatOpt = opt(ICONS.chat, 'Onlayn-chat', null);
    chatOpt.onclick = function (e) { e.preventDefault(); openChat(chatOpt); };
    panel.appendChild(chatOpt);
    var phoneRow = opt(ICONS.phone, PHONE, 'tel:+998550555100');
    panel.appendChild(phoneRow);

    // main button
    var btn = h('button', 'width:100%; display:flex; align-items:center; justify-content:center; gap:9px; border:none; border-radius:24px; background:#16313A; color:#fff; padding:13px 14px; font-family:inherit; font-size:13.5px; font-weight:800; cursor:pointer;');
    btn.className = 'wz-btn';
    var LABEL_OPEN = 'Yordamga yozish';
    var LABEL_CLOSE = 'Bekor qilish';
    function setBtn(open) {
      var T = TR;
      btn.innerHTML = open
        ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="m18 15-6-6-6 6"/></svg><span>' + T(LABEL_CLOSE) + '</span>'
        : '<span style="display:flex;align-items:center;">' + ICONS.life + '</span><span>' + T(LABEL_OPEN) + '</span>';
    }
    setBtn(false);
    var open = false;
    var skipNextDocClick = false;
    var PANEL_BASE = 'display:none; flex-direction:column; gap:7px; padding-bottom:10px;';
    btn.onclick = function () {
      skipNextDocClick = true;
      open = !open;
      var collapsed = document.documentElement.classList.contains('nav-collapsed');
      if (open && collapsed) {
        // yopiq menyuda: qalqib chiquvchi panel
        var r = btn.getBoundingClientRect();
        panel.setAttribute('style', 'display:flex; flex-direction:column; gap:7px; position:fixed; z-index:9999; left:' + (r.right + 12) + 'px; bottom:' + Math.max(10, window.innerHeight - r.bottom) + 'px; background:#fff; border:1px solid #EDEFF2; border-radius:16px; box-shadow:0 12px 34px rgba(16,24,40,0.17); padding:10px; min-width:220px;');
      } else {
        panel.setAttribute('style', PANEL_BASE + (open ? ' display:flex;' : ''));
      }
      setBtn(open);
    };
    document.addEventListener('click', function (e) {
      if (skipNextDocClick) { skipNextDocClick = false; return; }
      if (!open) return;
      if (e.target === btn || btn.contains(e.target) || panel.contains(e.target)) return;
      open = false;
      panel.setAttribute('style', PANEL_BASE);
      setBtn(false);
    });

    wrap.appendChild(panel);
    wrap.appendChild(btn);
    row.parentNode.replaceChild(wrap, row);
  }

  function tryInit() {
    if (document.querySelector('.wz-support')) return;
    var row = findFooter();
    if (row) build(row);
  }

  tryInit();
  // React sidebar qayta chizilsa ham vidjetni qayta o'rnatamiz (cheklangan urinishlar)
  var _wzTries = 0;
  var _wzIv = setInterval(function () {
    _wzTries++;
    tryInit();
    if (_wzTries >= 15 || document.querySelector('.wz-support')) clearInterval(_wzIv);
  }, 1200);
})();
