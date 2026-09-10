(function () {
  var KEY = 'wasyt_theme', H = document.documentElement;

  /* ---------- palette maps (light hex -> dark hex) ---------- */
  var BG = {
    '#eef1f4':'#0e1621', '#ffffff':'#172230', '#fcfcfd':'#172230', '#fafbfc':'#172230',
    '#f7f8fa':'#1b2734', '#f7f9fb':'#1b2734', '#f5f7f9':'#1b2734', '#fafafa':'#1b2734',
    '#f0f2f5':'#1f2b39', '#f2f4f6':'#1f2b39', '#f4f6f8':'#1f2b39', '#eff1f3':'#1f2b39',
    '#eff6f7':'#15242c', '#f3fbfb':'#10303a', '#e3f3f5':'#103a40', '#e8f4fd':'#0f2f44',
    '#e7eaee':'#243140', '#eceef1':'#243140', '#edeff2':'#243140', '#d4d8dd':'#2a3848',
    '#fbf4ec':'#2c2419', '#fbe7d2':'#3c2e1c', '#fff7ed':'#2c2419',
    '#fbedec':'#2d1e1d', '#fad9d6':'#402623', '#fdecea':'#2d1e1d', '#fee2e0':'#402623',
    '#eafaf1':'#11331f', '#e6f7ee':'#11331f', '#d9f2e3':'#163d29',
    '#f0f2f5':'#1f2b39'
  };
  var BORDER = {
    '#e7eaee':'#27333f', '#eceef1':'#27333f', '#edeff2':'#27333f', '#ecedef':'#27333f',
    '#f2f4f6':'#222e3a', '#eef1f4':'#222e3a', '#f4f6f8':'#222e3a', '#e9ecef':'#27333f',
    '#cfeaec':'#1c4a4f', '#cfeaec':'#1c4a4f', '#e1e6eb':'#2a3744'
  };
  var TEXT = {
    '#16313a':'#e7eef4', '#16313b':'#e7eef4', '#1f2d3a':'#e7eef4', '#0f1b24':'#e7eef4',
    '#1a2b36':'#e7eef4', '#142733':'#e7eef4', '#16242c':'#e7eef4',
    '#46535f':'#aab8c5', '#5a6675':'#a3b3c1', '#5a6b7b':'#a3b3c1',
    '#7c8794':'#90a7b6', '#8a93a0':'#90a7b6', '#9aa3ae':'#8fa0ad', '#7a8b99':'#90a7b6',
    '#7a8794':'#90a7b6', '#aeb6c0':'#7f8b97', '#a7b0ba':'#7f8b97', '#9ab0bd':'#90a7b6',
    '#b0b8c2':'#7f8b97'
  };

  function rgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    return 'rgb(' + parseInt(hex.slice(0,2),16) + ', ' + parseInt(hex.slice(2,4),16) + ', ' + parseInt(hex.slice(4,6),16) + ')';
  }
  // rebuild maps keyed by normalized rgb() string
  function toRgbMap(m) { var o = {}; for (var k in m) o[rgb(k)] = rgb(m[k]); return o; }
  var BGr = toRgbMap(BG), BORDERr = toRgbMap(BORDER), TEXTr = toRgbMap(TEXT);
  // for svg attribute (hex) lookups
  function hexKey(v){ v=(v||'').trim().toLowerCase(); if(v[0]!=='#')return null; if(v.length===4)v='#'+v[1]+v[1]+v[2]+v[2]+v[3]+v[3]; return v; }

  /* ---------- apply / restore per element ---------- */
  var SIDES = ['Top','Right','Bottom','Left'];
  function darkenEl(el) {
    if (el.nodeType !== 1) return;
    var s = el.style;
    // background
    if (s.backgroundColor && BGr[s.backgroundColor] && el.dataset.dmbg === undefined) {
      el.dataset.dmbg = s.backgroundColor; s.backgroundColor = BGr[s.backgroundColor];
    }
    // text color
    if (s.color && TEXTr[s.color] && el.dataset.dmc === undefined) {
      el.dataset.dmc = s.color; s.color = TEXTr[s.color];
    }
    // borders (per side)
    for (var i=0;i<4;i++){
      var p = 'border'+SIDES[i]+'Color', dk = 'dmb'+i;
      var cur = s[p];
      if (cur && BORDERr[cur] && el.dataset[dk] === undefined) { el.dataset[dk] = cur; s[p] = BORDERr[cur]; }
    }
    // svg stroke / fill attributes
    if (el.namespaceURI && el.namespaceURI.indexOf('svg') !== -1) {
      ['stroke','fill'].forEach(function(at){
        var v = el.getAttribute(at); if(!v) return;
        var hk = hexKey(v); if(!hk) return;
        var tgt = TEXT[hk]; if(tgt && el.dataset['dma_'+at]===undefined){ el.dataset['dma_'+at]=v; el.setAttribute(at, tgt); }
      });
    }
  }
  function restoreEl(el) {
    if (el.nodeType !== 1) return;
    var s = el.style, d = el.dataset;
    if (d.dmbg !== undefined){ s.backgroundColor = d.dmbg; delete d.dmbg; }
    if (d.dmc !== undefined){ s.color = d.dmc; delete d.dmc; }
    for (var i=0;i<4;i++){ var dk='dmb'+i; if(d[dk]!==undefined){ s['border'+SIDES[i]+'Color']=d[dk]; delete d[dk]; } }
    ['stroke','fill'].forEach(function(at){ var k='dma_'+at; if(d[k]!==undefined){ el.setAttribute(at,d[k]); delete d[k]; } });
  }
  function walk(root, fn){ fn(root); var all = root.querySelectorAll('*'); for (var i=0;i<all.length;i++) fn(all[i]); }

  function setDark(on, persist) {
    if (on) { H.classList.add('wasyt-dark'); walk(document.body, darkenEl); }
    else { H.classList.remove('wasyt-dark'); walk(document.body, restoreEl); }
    if (persist) { try { localStorage.setItem(KEY, on ? 'dark' : 'light'); } catch(e){} }
    refreshIcons();
  }
  window.wasytToggleTheme = function(){ setDark(!H.classList.contains('wasyt-dark'), true); };

  /* ---------- base stylesheet (things inline remap can't touch) ---------- */
  function injectStyle(){
    if (document.getElementById('wasyt-theme-style')) return;
    var s = document.createElement('style'); s.id='wasyt-theme-style';
    s.textContent = [
      'html.wasyt-dark, html.wasyt-dark body { background:#0e1621 !important; }',
      'html.wasyt-dark ::-webkit-scrollbar-thumb { background:#2a3848 !important; }',
      'html.wasyt-dark ::placeholder { color:#6c7a87 !important; }',
      '.wasyt-theme-toggle { width:44px; height:44px; border-radius:50%; border:1px solid #ECEEF1; background:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; padding:0; box-sizing:border-box; }',
      'html.wasyt-dark .wasyt-theme-toggle { border-color:#27333f; }',
      'html.wasyt-dark [data-wasyt-tube] { background:#182430 !important; border-color:#27333f !important; }',
      'html.wasyt-dark [data-wasyt-soz] { background:#182430 !important; border-color:#27333f !important; color:#B9C6CF !important; }',
      '@media (max-width: 1180px){ [data-wasyt-soz] > [data-soz-label] { display:none !important; } [data-wasyt-soz] { width:44px !important; padding:0 !important; gap:0 !important; justify-content:center !important; } }',
      /* keep the whole header row inside the viewport at preview widths */
      /* header must grow, not clip: fixed 76px height + non-shrinking pills caused overflow */
      'header { flex-wrap: wrap !important; row-gap: 10px !important; height: auto !important; min-height: 76px !important; align-content: center !important; }',
      'header { justify-content: flex-end !important; }',
      'header [data-i18n-toggle] { order: 7 !important; }',
      /* rate pill: icon-only below 1240px (hide every text span, keep the $ badge) */
      '@media (max-width: 1240px){ header [data-wasyt-rate] { width:44px !important; padding:0 !important; gap:0 !important; justify-content:center !important; } header [data-wasyt-rate] > span ~ span { display:none !important; } }'
    ].join('\n');
    (document.head || document.documentElement).appendChild(s);
  }

  /* ---------- header toggle button ---------- */
  var MOON = '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#5A6675" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>';
  var SUN  = '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#9fb0bf" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  function refreshIcons(){
    var dark = H.classList.contains('wasyt-dark');
    var btns = document.querySelectorAll('[data-wasyt-theme]');
    for (var i=0;i<btns.length;i++){ btns[i].innerHTML = dark?SUN:MOON; btns[i].setAttribute('title', dark?'Kunduzgi rejim':'Tungi rejim'); }
  }
  function ensureButton(){
    var headers = document.querySelectorAll('header');
    for (var h=0; h<headers.length; h++){
      var header = headers[h];
      // exactly one toggle per header
      var existing = header.querySelectorAll('[data-wasyt-theme]');
      for (var k=1;k<existing.length;k++){ if(existing[k].parentNode) existing[k].parentNode.removeChild(existing[k]); }
      if (existing.length >= 1) continue;
      var btn = document.createElement('button');
      btn.className='wasyt-theme-toggle'; btn.setAttribute('data-wasyt-theme','1'); btn.type='button';
      btn.addEventListener('click', function(e){ e.preventDefault(); window.wasytToggleTheme(); });
      // find the rightmost centered flex cluster in the header (the one holding the profile avatar)
      var cluster = null, kids = header.children;
      for (var c=kids.length-1;c>=0;c--){
        var el = kids[c], cs = getComputedStyle(el);
        if (cs.position==='fixed' || cs.display==='none') continue;      // skip modals
        if (cs.display.indexOf('flex')!==-1){ cluster = el; break; }
      }
      if (cluster) { cluster.insertBefore(btn, cluster.firstChild); }
      else {
        // no dedicated cluster: sit after the trailing flex spacer so the pills stay right-aligned
        var anchor = null;
        for (var c2=kids.length-1;c2>=0;c2--){
          var k = kids[c2];
          if (parseFloat(getComputedStyle(k).flexGrow) > 0) { anchor = k; break; }
        }
        if (anchor && anchor.nextSibling) header.insertBefore(btn, anchor.nextSibling);
        else header.appendChild(btn);
      }
    }
    ensureAI();
    refreshIcons();
  }
  var SPARK='<svg width="17" height="17" viewBox="0 0 24 24" fill="#fff"><path d="M12 2.2l1.9 5.1a4 4 0 0 0 2.4 2.4l5.1 1.9-5.1 1.9a4 4 0 0 0-2.4 2.4L12 21l-1.9-5.1a4 4 0 0 0-2.4-2.4L2.6 11.6l5.1-1.9a4 4 0 0 0 2.4-2.4z"/></svg>';
  function ensureAI(){
    var headers = document.querySelectorAll('header');
    for (var h=0; h<headers.length; h++){
      var header = headers[h];
      var have = header.querySelectorAll('[data-wasyt-ai]');
      for (var k=1;k<have.length;k++){ if(have[k].parentNode) have[k].parentNode.removeChild(have[k]); }
      if (have.length >= 1) continue;
      var moon = header.querySelector('[data-wasyt-theme]');
      if (!moon || !moon.parentNode) continue;
      var pill = document.createElement('button');
      pill.setAttribute('data-wasyt-ai','1'); pill.type='button';
      pill.style.cssText='display:inline-flex;align-items:center;justify-content:center;gap:6px;height:44px;box-sizing:border-box;background:linear-gradient(135deg,#14A0AE,#0E7C88);color:#fff;border:none;border-radius:14px;padding:0 18px;font:800 14px/1 Manrope,system-ui,sans-serif;letter-spacing:0.3px;cursor:pointer;flex-shrink:0;box-shadow:0 2px 8px rgba(14,124,136,0.28);';
      pill.innerHTML=SPARK+'<span>AI</span>';
      pill.addEventListener('click', function(e){ e.preventDefault(); if(window.wasytToggleAI) window.wasytToggleAI(); else window.dispatchEvent(new CustomEvent('wasyt-ai-toggle')); });
      moon.parentNode.insertBefore(pill, moon);
    }
    ensureSoz();
    fitSoz();
    ensureTube();
    ensureRate();
    ensureOrder();
  }

  /* ---------- Sozlamalar pill ---------- */
  var GEAR='<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.81 1.17V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15H4.5a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 6 9.4l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 11 6.6V4.5a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 2.82 1.17l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 11h.1a2 2 0 1 1 0 4h-.1Z"/></svg>';
  function ensureSoz(){
    var headers = document.querySelectorAll('header');
    for (var h=0; h<headers.length; h++){
      var header = headers[h];
      var have = header.querySelectorAll('[data-wasyt-soz]');
      for (var k=1;k<have.length;k++){ if(have[k].parentNode) have[k].parentNode.removeChild(have[k]); }
      if (have.length >= 1) continue;
      var moon = header.querySelector('[data-wasyt-theme]');
      if (!moon || !moon.parentNode) continue;
      var a = document.createElement('a');
      a.setAttribute('data-wasyt-soz','1');
      a.href = 'Wasyt - Sozlamalar.dc.html';
      a.title = 'Sozlamalar';
      a.style.cssText='display:inline-flex;align-items:center;gap:9px;height:44px;box-sizing:border-box;padding:0 18px;border-radius:999px;background:#F4F6F8;border:1px solid #ECEEF1;color:#46535F;font:700 14px/1 Manrope,system-ui,sans-serif;text-decoration:none;cursor:pointer;white-space:nowrap;flex-shrink:0;';
      a.innerHTML = GEAR + '<span data-soz-label>Sozlamalar</span>';
      a.addEventListener('mouseenter', function(){ this.style.background='#E3F3F5'; this.style.borderColor='#14A0AE'; this.style.color='#0E7C88'; });
      a.addEventListener('mouseleave', function(){ this.style.background='#F4F6F8'; this.style.borderColor='#ECEEF1'; this.style.color='#46535F'; });
      moon.parentNode.insertBefore(a, moon);
    }
  }

  function fitSoz(){
    var narrow = (window.innerWidth || 1200) < 1180;
    var pills = document.querySelectorAll('[data-wasyt-soz]');
    for (var i=0;i<pills.length;i++){
      var p = pills[i], lab = p.querySelector('[data-soz-label]');
      if (lab) lab.style.display = narrow ? 'none' : '';
      p.style.width = narrow ? '44px' : '';
      p.style.padding = narrow ? '0' : '0 18px';
      p.style.gap = narrow ? '0' : '9px';
      p.style.justifyContent = 'center';
    }
  }
  window.addEventListener('resize', fitSoz);

  /* ---------- header control order ----------
     Never re-parent React-rendered nodes (that threw removeChild); only set
     flex order on the pills theme.js itself injected. */
  var ORDER = [['[data-wasyt-rate]',1],['[data-wasyt-ai]',2],['[data-wasyt-soz]',3],['[data-wasyt-theme]',4],['[data-wasyt-sms]',5],['[data-wasyt-tube]',6],['[data-wasyt-profile]',9]];
  var PROFILE_HINT = 'div[style*="border-radius:50%"], div[style*="border-radius: 50%"]';
  function ensureOrder(){
    var headers = document.querySelectorAll('header');
    for (var h=0; h<headers.length; h++){
      var header = headers[h];
      for (var j=0;j<ORDER.length;j++){
        var el = header.querySelector(ORDER[j][0]);
        if (el) { el.style.order = ORDER[j][1]; if (j===0) el.style.marginLeft='auto'; }
      }
      // the profile avatar lives inside the same cluster as the pills: push it to the far right
      var moonEl = header.querySelector('[data-wasyt-theme]');
      var scope = (moonEl && moonEl.parentNode) ? moonEl.parentNode : header;
      if (!scope.querySelector('[data-wasyt-profile]')){
        var kids = scope.children;
        for (var q=0;q<kids.length;q++){
          var k = kids[q];
          if (k.matches && !k.matches('[data-wasyt-rate],[data-wasyt-ai],[data-wasyt-soz],[data-wasyt-theme],[data-wasyt-sms],[data-wasyt-tube],[data-i18n-toggle]')
              && k.querySelector && k.querySelector('svg') && k.offsetWidth > 0 && k.offsetWidth <= 56 && k.offsetHeight <= 56){
            k.setAttribute('data-wasyt-profile','1');
            k.style.order = 9;
            break;
          }
        }
      }
    }
  }


  /* ---------- YouTube / video darslik ---------- */
  var TUBE='<svg width="22" height="22" viewBox="0 0 24 24" fill="#E5544E"><path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.9 4.8 12 4.8 12 4.8s-5.9 0-7.6.4a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12c0 1.6.1 3.2.4 4.8a2.8 2.8 0 0 0 2 2c1.7.4 7.6.4 7.6.4s5.9 0 7.6-.4a2.8 2.8 0 0 0 2-2c.3-1.6.4-3.2.4-4.8s-.1-3.2-.4-4.8ZM10.2 15.1V8.9l5.1 3.1-5.1 3.1Z"/></svg>';
  function ensureTube(){
    var headers = document.querySelectorAll('header');
    for (var h=0; h<headers.length; h++){
      var header = headers[h];
      var have = header.querySelectorAll('[data-wasyt-tube]');
      for (var k=1;k<have.length;k++){ if(have[k].parentNode) have[k].parentNode.removeChild(have[k]); }
      if (have.length >= 1) continue;
      var moon = header.querySelector('[data-wasyt-theme]');
      if (!moon || !moon.parentNode) continue;
      var a = document.createElement('a');
      a.setAttribute('data-wasyt-tube','1');
      a.href = "Wasyt - Video darslik.dc.html";
      a.title = 'Video darslik';
      a.style.cssText='width:44px;height:44px;box-sizing:border-box;border-radius:50%;border:1px solid #ECEEF1;background:#F4F6F8;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;text-decoration:none;flex-shrink:0;';
      a.innerHTML=TUBE;
      moon.parentNode.insertBefore(a, moon.nextSibling);
    }
  }

  /* ---------- USD exchange-rate pill ---------- */
  var USD_RATE = '12 780';   // so'm / $
  var USD_TREND = '+0.3%';

  /* today's bank buy/sell rates */
  var BANKS = [
    { n:'Agrobank',            c:'#1FA64A', d:'agrobank.uz',    buy:'11 965', sell:'12 055' },
    { n:'Anorbank',            c:'#8E1F3B', d:'anorbank.uz',    buy:'11 990', sell:'12 060' },
    { n:'Asia Alliance Bank',  c:'#1B75BC', d:'aab.uz',         buy:'12 000', sell:'12 050' },
    { n:'Davr-bank',           c:'#2AA9A0', d:'davrbank.uz',    buy:'11 950', sell:'12 050' },
    { n:'Hamkorbank',          c:'#12A05A', d:'hamkorbank.uz',  buy:'11 950', sell:'12 060' },
    { n:'InFinBank',           c:'#E4322B', d:'infinbank.com',  buy:'12 000', sell:'12 060' },
    { n:'Ipoteka-bank',        c:'#1FA64A', d:'ipotekabank.uz', buy:'11 950', sell:'12 070' },
    { n:'Orient Finans Bank',  c:'#0E9C8E', d:'ofb.uz',         buy:'12 000', sell:'12 060' },
    { n:"O'zmilliybank",       c:'#B48A2E', d:'nbu.uz',         buy:'11 980', sell:'12 050' },
    { n:'Poytaxt bank',        c:'#C4302B', d:'poytaxtbank.uz', buy:'11 950', sell:'12 060' },
    { n:'Xalq bank',           c:'#1B9E6A', d:'xb.uz',          buy:'11 980', sell:'12 070' },
    { n:'"BRB" ATB',           c:'#D0333A', d:'brb.uz',         buy:'11 995', sell:'12 060' }
  ];
  function todayStr(){
    var d=new Date(), p=function(x){return (x<10?'0':'')+x;};
    return p(d.getDate())+'.'+p(d.getMonth()+1)+'.'+d.getFullYear();
  }
  function openRateModal(){
    if (document.querySelector('[data-wasyt-ratemodal]')) return;
    var ov = document.createElement('div');
    ov.setAttribute('data-wasyt-ratemodal','1');
    ov.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(16,32,40,.42);backdrop-filter:blur(3px);display:flex;align-items:flex-start;justify-content:center;padding:64px 20px 40px;overflow:auto;';
    ov.addEventListener('click', function(e){ if(e.target===ov) close(); });
    function close(){ if(ov.parentNode) ov.parentNode.removeChild(ov); document.removeEventListener('keydown',onKey); }
    function onKey(e){ if(e.key==='Escape') close(); }
    document.addEventListener('keydown', onKey);

    var rows = BANKS.map(function(b){
      var initials = b.n.replace(/["']/g,'').split(/\s+/).slice(0,2).map(function(w){return w.charAt(0).toUpperCase();}).join('');
      return '<div style="display:grid;grid-template-columns:1fr 108px 108px;align-items:center;gap:12px;padding:13px 22px;border-top:1px solid #F0F2F5;">'+
          '<div style="display:flex;align-items:center;gap:11px;min-width:0;">'+
            '<span style="font:700 14px/1.2 Manrope,system-ui,sans-serif;color:#16313A;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+b.n+'</span>'+
          '</div>'+
          '<div style="text-align:right;font:800 15px/1 Manrope,system-ui,sans-serif;color:#16313A;font-variant-numeric:tabular-nums;">'+b.buy+'</div>'+
          '<div style="text-align:right;font:800 15px/1 Manrope,system-ui,sans-serif;color:#1AA565;font-variant-numeric:tabular-nums;">'+b.sell+'</div>'+
        '</div>';
    }).join('');

    var box = document.createElement('div');
    box.style.cssText='width:100%;max-width:560px;background:#fff;border-radius:20px;box-shadow:0 24px 70px rgba(16,32,40,.28);overflow:hidden;font-family:Manrope,system-ui,sans-serif;';
    box.innerHTML =
      '<div style="display:flex;align-items:center;gap:14px;padding:20px 22px;background:linear-gradient(135deg,#0E7C88,#14A0AE);color:#fff;">'+
        '<span style="width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center;font:800 20px/1 Manrope,system-ui,sans-serif;flex-shrink:0;">$</span>'+
        '<div style="flex:1;min-width:0;">'+
          '<div style="font:800 16px/1.25 Manrope,system-ui,sans-serif;">Banklarda dollar kursi</div>'+
          '<div style="font:600 12px/1.3 Manrope,system-ui,sans-serif;opacity:.85;margin-top:2px;">So\'mga nisbatan · '+todayStr()+'</div>'+
        '</div>'+
        '<button data-wasyt-rateclose style="width:34px;height:34px;border:none;border-radius:10px;background:rgba(255,255,255,.16);color:#fff;cursor:pointer;font-size:20px;line-height:1;display:flex;align-items:center;justify-content:center;flex-shrink:0;">&times;</button>'+
      '</div>'+
      '<div style="display:grid;grid-template-columns:1fr 108px 108px;gap:12px;padding:12px 22px;background:#F7F9FB;">'+
        '<div style="font:700 11px/1 Manrope,system-ui,sans-serif;color:#8A96A3;letter-spacing:.04em;text-transform:uppercase;">Bank nomi</div>'+
        '<div style="text-align:right;font:700 11px/1 Manrope,system-ui,sans-serif;color:#8A96A3;letter-spacing:.04em;text-transform:uppercase;">Sotib olish</div>'+
        '<div style="text-align:right;font:700 11px/1 Manrope,system-ui,sans-serif;color:#8A96A3;letter-spacing:.04em;text-transform:uppercase;">Sotish</div>'+
      '</div>'+
      '<div style="max-height:52vh;overflow:auto;">'+rows+'</div>'+
      '<div style="padding:13px 22px;border-top:1px solid #F0F2F5;font:600 11.5px/1.4 Manrope,system-ui,sans-serif;color:#AEB6C0;text-align:center;">Ma\'lumot faqat namoyish uchun · manba: bank shoxobchalari</div>';
    box.querySelector('[data-wasyt-rateclose]').addEventListener('click', close);
    // logo fallback → colored initials badge when a logo fails to load
    box.querySelectorAll('img.wbk-logo').forEach(function(img){
      img.addEventListener('error', function(){
        var sp = img.parentNode; if(!sp) return;
        var c = img.getAttribute('data-c'), ini = img.getAttribute('data-ini');
        sp.style.background = c; sp.style.border='none';
        sp.innerHTML = '<span style="color:#fff;font:800 11px/1 Manrope,system-ui,sans-serif;letter-spacing:.2px;">'+ini+'</span>';
      });
    });
    ov.appendChild(box);
    document.body.appendChild(ov);
  }

  function ensureRate(){
    var headers = document.querySelectorAll('header');
    for (var h=0; h<headers.length; h++){
      var header = headers[h];
      var have = header.querySelectorAll('[data-wasyt-rate]');
      for (var k=1;k<have.length;k++){ if(have[k].parentNode) have[k].parentNode.removeChild(have[k]); }
      if (have.length >= 1) continue;
      // anchor: sit just before the AI pill (leftmost of the icon cluster)
      var ai = header.querySelector('[data-wasyt-ai]');
      if (!ai || !ai.parentNode) continue;
      var chip = document.createElement('div');
      chip.setAttribute('data-wasyt-rate','1');
      chip.setAttribute('title','Bugungi dollar kursi');
      chip.style.cssText='display:inline-flex;align-items:center;gap:7px;background:#fff;border:1px solid #E7EAEE;border-radius:14px;padding:0 14px 0 9px;height:44px;box-sizing:border-box;flex-shrink:0;cursor:pointer;user-select:none;transition:border-color .15s,box-shadow .15s;';
      chip.addEventListener('mouseenter', function(){ this.style.borderColor='#CDD4DB'; this.style.boxShadow='0 2px 8px rgba(16,49,58,.06)'; });
      chip.addEventListener('mouseleave', function(){ this.style.borderColor='#E7EAEE'; this.style.boxShadow='none'; });
      chip.addEventListener('click', function(e){ e.preventDefault(); openRateModal(); });
      chip.innerHTML =
        '<span style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#14A0AE,#0E7C88);color:#fff;display:flex;align-items:center;justify-content:center;font:800 12px/1 Manrope,system-ui,sans-serif;flex-shrink:0;">$</span>' +
        '<span style="display:inline-flex;align-items:baseline;gap:4px;white-space:nowrap;">' +
          '<span style="font:800 14px/1 Manrope,system-ui,sans-serif;color:#16313A;letter-spacing:-0.01em;font-variant-numeric:tabular-nums;">'+USD_RATE+'</span>' +
          '<span style="font:600 11px/1 Manrope,system-ui,sans-serif;color:#AEB6C0;">so\'m</span>' +
        '</span>';
      ai.parentNode.insertBefore(chip, ai);
    }
    ensureSms();
    ensureOrder();
  }

  /* ---------- SMS quick panel ---------- */
  var SMS_BALANCE = '8 450';          // qolgan SMS soni
  var SMS_PRICE   = '200';            // bitta SMS narxi (so'm)
  var SMS_GROUPS = [
    { v:'all',   label:"Barcha mijozlar",  cnt:'1 284' },
    { v:'debt',  label:"Qarzdor mijozlar", cnt:'96' },
    { v:'vip',   label:"VIP mijozlar",     cnt:'54' },
    { v:'one',   label:"Bitta raqamga",    cnt:'—' }
  ];
  var SMS_QUICK = [
    { label:"Qarz eslatmasi", cat:'qarz',   text:"Hurmatli {ism}, qarz to'lovi muddati yaqinlashdi. Qoldiq: {summa} so'm." },
    { label:"Bayram tabrigi", cat:'bayram', text:"Hurmatli {ism}, bayramingiz muborak bo'lsin! WASYT jamoasi." },
    { label:"Aksiya",         cat:'aksiya', text:"{ism}, bugun WASYT'da maxsus chegirmalar! Batafsil: wasyt.uz" }
  ];
  var SMS_RECENT = [
    { to:"Qarzdor mijozlar", cnt:'96',  when:"Bugun 09:14", ok:true },
    { to:"Barcha mijozlar",  cnt:'1 284',when:"Kecha 18:02", ok:true },
    { to:"+998 90 123-45-67",cnt:'1',   when:"Kecha 12:40", ok:true }
  ];
  // O'zbekiston bayram (qizil) kunlari — key: "oy-kun" (oy 1..12)
  var SMS_MONTHS = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];
  var SMS_WD = ["Du","Se","Ch","Pa","Ju","Sh","Ya"];
  var SMS_HOLIDAYS = {
    '1-1':  { name:"Yangi yil",                    text:"Hurmatli {ism}, Yangi yilingiz muborak bo'lsin! Yangi yil sizga sog'lik, farovonlik va omad keltirsin. WASYT jamoasi." },
    '1-14': { name:"Vatan himoyachilari kuni",     text:"Hurmatli {ism}, Vatan himoyachilari kuni muborak bo'lsin! Tinch va farovon kunlar tilaymiz. WASYT jamoasi." },
    '3-8':  { name:"Xalqaro xotin-qizlar kuni",    text:"Hurmatli {ism}, 8-mart — Xalqaro xotin-qizlar kuni muborak bo'lsin! Baxt va quvonch sizga hamroh bo'lsin. WASYT jamoasi." },
    '3-20': { name:"Ramazon hayiti",               text:"Hurmatli {ism}, Ramazon hayiti muborak bo'lsin! Duolaringiz ijobat bo'lsin. WASYT jamoasi." },
    '3-21': { name:"Navro'z bayrami",              text:"Hurmatli {ism}, Navro'z bayrami muborak bo'lsin! Yangi kun sizga farovonlik va yangi rejalar keltirsin. WASYT jamoasi." },
    '5-9':  { name:"Xotira va qadrlash kuni",      text:"Hurmatli {ism}, Xotira va qadrlash kuni muborak bo'lsin! WASYT jamoasi." },
    '5-27': { name:"Qurbon hayiti",                text:"Hurmatli {ism}, Qurbon hayiti muborak bo'lsin! Xayrli va baraka topgan kunlar tilaymiz. WASYT jamoasi." },
    '9-1':  { name:"Mustaqillik kuni",             text:"Hurmatli {ism}, Mustaqillik kuni muborak bo'lsin! Yurtimizga tinchlik va ravnaq tilaymiz. WASYT jamoasi." },
    '10-1': { name:"O'qituvchi va murabbiylar kuni",text:"Hurmatli {ism}, O'qituvchi va murabbiylar kuni muborak bo'lsin! WASYT jamoasi." },
    '12-8': { name:"Konstitutsiya kuni",           text:"Hurmatli {ism}, Konstitutsiya kuni muborak bo'lsin! WASYT jamoasi." }
  };
  // yaqinlashib kelayotgan bayramlar (bugundan boshlab, kun bo'yicha)
  function upcomingHolidays(win){
    var now=new Date(); now.setHours(0,0,0,0);
    var yr=now.getFullYear(), arr=[];
    Object.keys(SMS_HOLIDAYS).forEach(function(k){
      var p=k.split('-'), d=new Date(yr,+p[0]-1,+p[1]); d.setHours(0,0,0,0);
      var diff=Math.round((d-now)/86400000);
      if(diff<0){ d=new Date(yr+1,+p[0]-1,+p[1]); d.setHours(0,0,0,0); diff=Math.round((d-now)/86400000); }
      arr.push({ key:k, name:SMS_HOLIDAYS[k].name, date:d, days:diff });
    });
    arr.sort(function(a,b){ return a.days-b.days; });
    return (win==null) ? arr : arr.filter(function(h){ return h.days<=win; });
  }
  var HOLI_WINDOW = 60; // shuncha kun ichidagi bayramlar uchun eslatma
  // tug'ilgan kuni bor mijozlar (dd.mm) — SMS paneli uchun
  var SMS_BDAYS = [
    { name:"Aziz To'rayev",   phone:"+998 97 625 51 00", bd:"15.06" },
    { name:"Jamshid Aliyev",  phone:"+998 90 234 76 55", bd:"09.08" },
    { name:"Dilshod Karimov", phone:"+998 90 111 22 33", bd:"03.02" },
    { name:"Nigora Saidova",  phone:"+998 93 501 44 18", bd:"27.11" },
    { name:"Sardor Odilov",   phone:"+998 88 320 65 87", bd:"12.12" },
    { name:"Kamola Nazarova", phone:"+998 99 512 66 88", bd:"21.03" }
  ];
  function upcomingBirthdays(){
    var now=new Date(); now.setHours(0,0,0,0); var yr=now.getFullYear();
    return SMS_BDAYS.map(function(b){
      var p=b.bd.split('.'), d=new Date(yr,+p[1]-1,+p[0]); d.setHours(0,0,0,0);
      var diff=Math.round((d-now)/86400000);
      if(diff<0){ d=new Date(yr+1,+p[1]-1,+p[0]); d.setHours(0,0,0,0); diff=Math.round((d-now)/86400000); }
      return { name:b.name, phone:b.phone, date:d, days:diff };
    }).sort(function(a,b){ return a.days-b.days; });
  }
  function openSmsModal(){
    if (document.querySelector('[data-wasyt-smsmodal]')) return;
    var ov = document.createElement('div');
    ov.setAttribute('data-wasyt-smsmodal','1');
    ov.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(16,32,40,.42);backdrop-filter:blur(3px);display:flex;align-items:flex-start;justify-content:center;padding:56px 20px 40px;overflow:auto;';
    ov.addEventListener('click', function(e){ if(e.target===ov) close(); });
    function close(){ if(ov.parentNode) ov.parentNode.removeChild(ov); document.removeEventListener('keydown',onKey); }
    function onKey(e){ if(e.key==='Escape') close(); }
    document.addEventListener('keydown', onKey);

    var groupOpts = SMS_GROUPS.map(function(g){
      return '<option value="'+g.v+'">'+g.label+(g.cnt!=='—'?(' · '+g.cnt+' ta'):'')+'</option>';
    }).join('');
    var quickChips = SMS_QUICK.map(function(q,i){
      return '<button data-sms-tpl="'+i+'" type="button" style="border:1px solid #DDE3E8;background:#fff;border-radius:20px;padding:7px 14px;font:700 12px/1 Manrope,system-ui,sans-serif;color:#5A6675;cursor:pointer;white-space:nowrap;transition:all .15s;">'+q.label+'</button>';
    }).join('');
    var recentRows = SMS_RECENT.map(function(r){
      return '<div style="display:flex;align-items:center;gap:12px;padding:11px 22px;border-top:1px solid #F0F2F5;">'+
          '<span style="width:34px;height:34px;border-radius:10px;background:#E3F3F5;color:#0E7C88;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>'+
          '<div style="flex:1;min-width:0;">'+
            '<div style="font:700 13.5px/1.2 Manrope,system-ui,sans-serif;color:#16313A;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+r.to+'</div>'+
            '<div style="font:600 11.5px/1.3 Manrope,system-ui,sans-serif;color:#9AA3AE;margin-top:2px;">'+r.cnt+' ta qabul qiluvchi · '+r.when+'</div>'+
          '</div>'+
          '<span style="display:inline-flex;align-items:center;gap:5px;font:700 11px/1 Manrope,system-ui,sans-serif;color:#1AA565;background:#E7F6EE;border-radius:7px;padding:5px 9px;flex-shrink:0;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Yuborildi</span>'+
        '</div>';
    }).join('');

    var box = document.createElement('div');
    box.style.cssText='width:100%;max-width:540px;background:#fff;border-radius:20px;box-shadow:0 24px 70px rgba(16,32,40,.28);overflow:hidden;font-family:Manrope,system-ui,sans-serif;';
    box.innerHTML =
      // header
      '<div style="display:flex;align-items:center;gap:14px;padding:20px 22px;background:linear-gradient(135deg,#0E7C88,#14A0AE);color:#fff;">'+
        '<span style="width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>'+
        '<div style="flex:1;min-width:0;">'+
          '<div style="font:800 16px/1.25 Manrope,system-ui,sans-serif;">SMS xabarlar</div>'+
          '<div style="font:600 12px/1.3 Manrope,system-ui,sans-serif;opacity:.85;margin-top:2px;">Tezkor yuborish va balans</div>'+
        '</div>'+
        '<button data-sms-close style="width:34px;height:34px;border:none;border-radius:10px;background:rgba(255,255,255,.16);color:#fff;cursor:pointer;font-size:20px;line-height:1;display:flex;align-items:center;justify-content:center;flex-shrink:0;">&times;</button>'+
      '</div>'+
      // balance strip
      '<div style="display:flex;align-items:center;gap:12px;padding:14px 22px;background:#F7F9FB;border-bottom:1px solid #EEF1F4;">'+
        '<div style="flex:1;min-width:0;">'+
          '<div style="font:700 11px/1 Manrope,system-ui,sans-serif;color:#8A96A3;letter-spacing:.04em;text-transform:uppercase;">SMS balans</div>'+
          '<div style="margin-top:4px;display:flex;align-items:baseline;gap:6px;"><span style="font:800 22px/1 Manrope,system-ui,sans-serif;color:#16313A;font-variant-numeric:tabular-nums;">'+SMS_BALANCE+'</span><span style="font:600 12px/1 Manrope,system-ui,sans-serif;color:#9AA3AE;">ta qoldi · '+SMS_PRICE+' so\'m/SMS</span></div>'+
        '</div>'+
        '<button data-sms-topup type="button" style="border:1px solid #14A0AE;background:#E3F3F5;color:#0E7C88;border-radius:11px;padding:9px 15px;font:700 12.5px/1 Manrope,system-ui,sans-serif;cursor:pointer;flex-shrink:0;">To\'ldirish</button>'+
      '</div>'+
      // quick send form
      '<div style="padding:18px 22px 8px;">'+
        '<div style="font:700 11px/1 Manrope,system-ui,sans-serif;color:#8A96A3;letter-spacing:.04em;text-transform:uppercase;margin-bottom:8px;">Kimga</div>'+
        '<select data-sms-group style="width:100%;box-sizing:border-box;border:1px solid #DDE3E8;border-radius:11px;padding:11px 13px;font:600 13.5px/1 Manrope,system-ui,sans-serif;color:#16313A;background:#fff;cursor:pointer;">'+groupOpts+'</select>'+
        '<div data-sms-onewrap style="display:none;margin-top:10px;"><input data-sms-onenum type="tel" placeholder="+998 __ ___-__-__" style="width:100%;box-sizing:border-box;border:1px solid #DDE3E8;border-radius:11px;padding:11px 13px;font:600 13.5px/1 Manrope,system-ui,sans-serif;color:#16313A;"/></div>'+
        // holiday calendar
        '<div style="display:flex;align-items:center;justify-content:space-between;margin:16px 0 8px;">'+
          '<span style="font:700 11px/1 Manrope,system-ui,sans-serif;color:#8A96A3;letter-spacing:.04em;text-transform:uppercase;">Bayram taqvimi</span>'+
          '<span style="display:inline-flex;align-items:center;gap:5px;font:600 11px/1 Manrope,system-ui,sans-serif;color:#AEB6C0;"><span style="width:9px;height:9px;border-radius:50%;background:#E5484D;"></span>Qizil kunlar — bayramlar</span>'+
        '</div>'+
        '<div data-sms-calwrap style="border:1px solid #EAEDF0;border-radius:14px;padding:12px 12px 10px;background:#FCFDFE;"></div>'+
        '<div data-sms-holibanner style="display:none;align-items:center;gap:10px;margin-top:12px;padding:11px 13px;border-radius:12px;background:#FDECEC;border:1px solid #F6C9CB;"></div>'+
        '<div data-sms-bdaywrap style="margin-top:16px;"></div>'+
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:14px 0 8px;">'+quickChips+'</div>'+
        '<div style="font:700 11px/1 Manrope,system-ui,sans-serif;color:#8A96A3;letter-spacing:.04em;text-transform:uppercase;margin-bottom:8px;">Xabar matni</div>'+
        '<textarea data-sms-text rows="3" placeholder="Xabar matnini kiriting..." style="width:100%;box-sizing:border-box;border:1px solid #DDE3E8;border-radius:11px;padding:11px 13px;font:600 13.5px/1.5 Manrope,system-ui,sans-serif;color:#16313A;resize:vertical;min-height:74px;"></textarea>'+
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:7px;">'+
          '<span data-sms-count style="font:600 11.5px/1 Manrope,system-ui,sans-serif;color:#AEB6C0;">0 belgi · 1 SMS</span>'+
          '<span style="font:600 11.5px/1 Manrope,system-ui,sans-serif;color:#C4CBD3;">{ism} · {summa} · {sana} — avtomatik almashtiriladi</span>'+
        '</div>'+
      '</div>'+
      // cost estimate strip
      '<div style="padding:6px 22px 0;"><div data-sms-cost style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border-radius:12px;background:#F3FAFB;border:1px solid #DCEEF0;"></div></div>'+
      // send button
      '<div style="padding:10px 22px 18px;">'+
        '<button data-sms-send type="button" style="width:100%;border:none;border-radius:12px;padding:13px;font:800 14px/1 Manrope,system-ui,sans-serif;color:#fff;background:linear-gradient(135deg,#0E7C88,#14A0AE);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>Yuborish</button>'+
      '</div>'+
      // recent
      '<div style="border-top:1px solid #EEF1F4;">'+
        '<div style="padding:14px 22px 4px;font:700 11px/1 Manrope,system-ui,sans-serif;color:#8A96A3;letter-spacing:.04em;text-transform:uppercase;">So\'nggi yuborilganlar</div>'+
        recentRows+
      '</div>'+
      // footer
      '<a href="Wasyt - Sozlamalar.dc.html" style="display:flex;align-items:center;justify-content:center;gap:6px;padding:14px;border-top:1px solid #F0F2F5;font:700 12.5px/1 Manrope,system-ui,sans-serif;color:#0E7C88;text-decoration:none;background:#F7F9FB;">Barcha shablonlar va kampaniyalar<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg></a>';

    box.querySelector('[data-sms-close]').addEventListener('click', close);

    // group → toggle single-number field
    var grpSel = box.querySelector('[data-sms-group]');
    var oneWrap = box.querySelector('[data-sms-onewrap]');
    grpSel.addEventListener('change', function(){ oneWrap.style.display = (grpSel.value==='one') ? 'block' : 'none'; recount(); });

    // textarea live counter + cost + template fill
    var ta = box.querySelector('[data-sms-text]');
    var counter = box.querySelector('[data-sms-count]');
    var costEl = box.querySelector('[data-sms-cost]');
    var SMS_PRICE_N = parseInt(String(SMS_PRICE).replace(/\D/g,''),10) || 0;
    var SMS_BAL_N   = parseInt(String(SMS_BALANCE).replace(/\D/g,''),10) || 0;
    function smsFmt(x){ return String(x).replace(/\B(?=(\d{3})+(?!\d))/g,' '); }
    function recipCount(){
      if(grpSel.value==='one') return 1;
      var g = SMS_GROUPS.filter(function(x){ return x.v===grpSel.value; })[0];
      return g ? (parseInt(String(g.cnt).replace(/\D/g,''),10) || 0) : 0;
    }
    function recount(){
      var n = ta.value.length;
      var parts = Math.max(1, Math.ceil(n/160));
      counter.textContent = n+' belgi \u00b7 '+parts+' SMS';
      var recips = recipCount();
      var needed = recips * parts;
      var total  = needed * SMS_PRICE_N;
      var over   = needed > SMS_BAL_N;
      costEl.style.background = over ? '#FDECEC' : '#F3FAFB';
      costEl.style.borderColor = over ? '#F6C9CB' : '#DCEEF0';
      costEl.innerHTML =
        '<div style="min-width:0;">'+
          '<div style="font:700 10.5px/1 Manrope,system-ui,sans-serif;color:'+(over?'#C05055':'#5E8F95')+';letter-spacing:.03em;text-transform:uppercase;">Taxminiy xarajat</div>'+
          '<div style="margin-top:4px;font:800 20px/1 Manrope,system-ui,sans-serif;color:'+(over?'#D63B40':'#0E7C88')+';font-variant-numeric:tabular-nums;">'+smsFmt(total)+' <span style="font:700 12px/1 Manrope,system-ui,sans-serif;color:'+(over?'#D98A8C':'#7FB0B6')+';">so\'m</span></div>'+
          (over ? '<div style="font:700 11px/1.3 Manrope,system-ui,sans-serif;color:#D63B40;margin-top:5px;">Balans yetarli emas \u2014 '+smsFmt(needed)+' / '+smsFmt(SMS_BAL_N)+' SMS</div>' : '')+
        '</div>'+
        '<div style="text-align:right;flex-shrink:0;">'+
          '<div style="font:700 12.5px/1.3 Manrope,system-ui,sans-serif;color:#16313A;">'+smsFmt(recips)+' ta \u00d7 '+parts+' SMS</div>'+
          '<div style="font:600 11px/1.4 Manrope,system-ui,sans-serif;color:#9AA3AE;margin-top:3px;">'+smsFmt(needed)+' SMS \u00d7 '+SMS_PRICE_N+' so\'m</div>'+
        '</div>';
    }
    ta.addEventListener('input', recount);
    box.querySelectorAll('[data-sms-tpl]').forEach(function(btn){
      btn.addEventListener('mouseenter', function(){ this.style.borderColor='#14A0AE'; this.style.color='#0E7C88'; this.style.background='#E3F3F5'; });
      btn.addEventListener('mouseleave', function(){ this.style.borderColor='#DDE3E8'; this.style.color='#5A6675'; this.style.background='#fff'; });
      btn.addEventListener('click', function(){ ta.value = SMS_QUICK[+btn.getAttribute('data-sms-tpl')].text; recount(); ta.focus(); });
    });

    // ----- holiday calendar -----
    var calWrap = box.querySelector('[data-sms-calwrap]');
    var holiBanner = box.querySelector('[data-sms-holibanner]');
    var today = new Date();
    var todayKey = (today.getMonth()+1)+'-'+today.getDate();
    // ochilishda — bugundan keyingi eng yaqin bayram oyini ko'rsatamiz
    function nearestHoliday(){
      var best=null, bestDelta=Infinity, yr=today.getFullYear();
      Object.keys(SMS_HOLIDAYS).forEach(function(k){
        var p=k.split('-'), d=new Date(yr, +p[0]-1, +p[1]);
        var delta=(d-today)/86400000;
        if(delta<-1) delta+=365; // o'tib ketgan bo'lsa keyingi yilga
        if(delta<bestDelta){ bestDelta=delta; best={m:+p[0]-1, key:k}; }
      });
      return best || { m: today.getMonth(), key:null };
    }
    var near = nearestHoliday();
    var calYear = today.getFullYear(), calMonth = near.m;
    var selectedKey = null;
    var selectedBdayIdx = null;
    var bdayWrap = box.querySelector('[data-sms-bdaywrap]');
    function smsInitials(n){ return (n||'').trim().split(/\s+/).map(function(w){return w[0]||'';}).slice(0,2).join('').toUpperCase(); }

    function selectHoliday(key){
      var h = SMS_HOLIDAYS[key]; if(!h) return;
      selectedKey = key; selectedBdayIdx = null;
      grpSel.value = 'all'; oneWrap.style.display='none';
      ta.value = h.text; recount();
      holiBanner.style.display='flex';
      holiBanner.style.background='#FDECEC'; holiBanner.style.borderColor='#F6C9CB';
      holiBanner.innerHTML =
        '<span style="width:30px;height:30px;border-radius:9px;background:#E5484D;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>'+
        '<div style="flex:1;min-width:0;"><div style="font:800 13px/1.2 Manrope,system-ui,sans-serif;color:#B4262A;">'+h.name+' tabrigi tayyor</div>'+
        '<div style="font:600 11.5px/1.3 Manrope,system-ui,sans-serif;color:#C56D6F;margin-top:2px;">Matn quyida — barcha mijozlarga yuboring</div></div>';
      renderCal(); renderBdays();
      ta.focus({ preventScroll:true });
    }

    // ----- birthday clients -----
    function selectBirthday(i, list){
      var b = list[i]; if(!b) return;
      selectedBdayIdx = i; selectedKey = null;
      grpSel.value = 'one'; oneWrap.style.display='block';
      var num = box.querySelector('[data-sms-onenum]'); if(num) num.value = b.phone;
      ta.value = "Hurmatli "+b.name+", tug'ilgan kuningiz muborak bo'lsin! Sizga sog'lik, baxt va farovonlik tilaymiz. WASYT jamoasi."; recount();
      holiBanner.style.display='flex';
      holiBanner.style.background='#EAF6F7'; holiBanner.style.borderColor='#BFE3E7';
      holiBanner.innerHTML =
        '<span style="width:30px;height:30px;border-radius:9px;background:#14A0AE;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>'+
        '<div style="flex:1;min-width:0;"><div style="font:800 13px/1.2 Manrope,system-ui,sans-serif;color:#0E7C88;">'+b.name+' — tug\'ilgan kun tabrigi tayyor</div>'+
        '<div style="font:600 11.5px/1.3 Manrope,system-ui,sans-serif;color:#5A9AA1;margin-top:2px;">Raqam to\'ldirildi — matnni ko\'rib, yuboring</div></div>';
      renderBdays(); renderCal();
      ta.focus({ preventScroll:true });
    }

    function renderBdays(){
      var up = upcomingBirthdays();
      var show = up.slice(0,4);
      if(!show.length){ bdayWrap.innerHTML=''; return; }
      var html = '<div style="display:flex;align-items:center;justify-content:space-between;margin:0 0 8px;">'+
        '<span style="font:700 11px/1 Manrope,system-ui,sans-serif;color:#8A96A3;letter-spacing:.04em;text-transform:uppercase;">Yaqin tug\'ilgan kunlar</span>'+
        '<span style="font:600 11px/1 Manrope,system-ui,sans-serif;color:#AEB6C0;">Mijozga tabrik yuboring</span>'+
      '</div>';
      html += '<div style="display:flex;flex-direction:column;gap:6px;">';
      show.forEach(function(b,i){
        var sel = (i===selectedBdayIdx);
        var dstr = b.date.getDate()+'-'+SMS_MONTHS[b.date.getMonth()].toLowerCase();
        var days = b.days===0?'Bugun':(b.days===1?'Ertaga':(b.days+' kun qoldi'));
        var soon = b.days<=7;
        html += '<button data-bday="'+i+'" type="button" style="display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:1px solid '+(sel?'#BFE3E7':'#EEF1F4')+';background:'+(sel?'#EAF6F7':'#fff')+';border-radius:11px;padding:8px 10px;cursor:pointer;">'+
          '<span style="width:30px;height:30px;border-radius:50%;background:#E3F3F5;color:#0E7C88;display:flex;align-items:center;justify-content:center;font:800 11px/1 Manrope,system-ui,sans-serif;flex-shrink:0;">'+smsInitials(b.name)+'</span>'+
          '<div style="flex:1;min-width:0;"><div style="font:700 13px/1.2 Manrope,system-ui,sans-serif;color:#16313A;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+b.name+'</div>'+
          '<div style="font:600 11px/1.3 Manrope,system-ui,sans-serif;color:'+(soon?'#C6791B':'#9AA3AE')+';margin-top:1px;">'+dstr+' \u00b7 '+days+'</div></div>'+
          '<span style="font:700 11px/1 Manrope,system-ui,sans-serif;color:#0E7C88;flex-shrink:0;display:inline-flex;align-items:center;gap:3px;">Tabrik<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg></span>'+
        '</button>';
      });
      html += '</div>';
      bdayWrap.innerHTML = html;
      bdayWrap.querySelectorAll('[data-bday]').forEach(function(el){
        el.addEventListener('click', function(){ selectBirthday(+el.getAttribute('data-bday'), show); });
      });
    }
    renderBdays();

    function renderCal(){
      var first = new Date(calYear, calMonth, 1);
      var offset = (first.getDay()+6)%7;               // dushanbadan boshlanadi
      var days = new Date(calYear, calMonth+1, 0).getDate();
      var html = '';
      // header
      html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">'+
        '<button data-cal-prev type="button" style="width:28px;height:28px;border:1px solid #E3E7EB;border-radius:8px;background:#fff;color:#5A6675;cursor:pointer;display:flex;align-items:center;justify-content:center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>'+
        '<span style="font:800 13.5px/1 Manrope,system-ui,sans-serif;color:#16313A;">'+SMS_MONTHS[calMonth]+' '+calYear+'</span>'+
        '<button data-cal-next type="button" style="width:28px;height:28px;border:1px solid #E3E7EB;border-radius:8px;background:#fff;color:#5A6675;cursor:pointer;display:flex;align-items:center;justify-content:center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>'+
      '</div>';
      // weekday row
      html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:4px;">';
      SMS_WD.forEach(function(w,i){
        html += '<div style="text-align:center;font:700 10.5px/1 Manrope,system-ui,sans-serif;color:'+(i>=5?'#E58A8C':'#AEB6C0')+';padding:2px 0;">'+w+'</div>';
      });
      html += '</div>';
      // day grid
      html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;">';
      for(var b=0;b<offset;b++) html += '<div></div>';
      for(var d=1; d<=days; d++){
        var key = (calMonth+1)+'-'+d;
        var hol = SMS_HOLIDAYS[key];
        var isToday = (calYear===today.getFullYear() && key===todayKey);
        var isSel = (key===selectedKey);
        var st;
        if(hol){
          st = 'cursor:pointer;background:'+(isSel?'#E5484D':'#FDECEC')+';color:'+(isSel?'#fff':'#D63B40')+';font-weight:800;border:1px solid '+(isSel?'#E5484D':'#F6C9CB')+';';
        } else {
          st = 'color:#5A6675;font-weight:600;border:1px solid transparent;';
        }
        if(isToday && !hol) st += 'box-shadow:inset 0 0 0 1.5px #14A0AE;color:#0E7C88;font-weight:800;';
        html += '<div '+(hol?('data-cal-day="'+key+'" title="'+hol.name+'"'):'')+' style="height:34px;display:flex;align-items:center;justify-content:center;border-radius:9px;font:13px/1 Manrope,system-ui,sans-serif;'+st+'">'+d+'</div>';
      }
      html += '</div>';
      // month holiday list
      var monthHols = Object.keys(SMS_HOLIDAYS).filter(function(k){ return +k.split('-')[0]===calMonth+1; });
      if(monthHols.length){
        html += '<div style="margin-top:10px;border-top:1px solid #EEF1F4;padding-top:9px;display:flex;flex-direction:column;gap:5px;">';
        monthHols.forEach(function(k){
          var h=SMS_HOLIDAYS[k], dd=k.split('-')[1], sel=(k===selectedKey);
          html += '<button data-cal-day="'+k+'" type="button" style="display:flex;align-items:center;gap:9px;width:100%;text-align:left;border:1px solid '+(sel?'#F0B7B9':'#EEF1F4')+';background:'+(sel?'#FDECEC':'#fff')+';border-radius:10px;padding:8px 10px;cursor:pointer;">'+
            '<span style="width:26px;height:26px;border-radius:7px;background:#FDECEC;color:#D63B40;display:flex;align-items:center;justify-content:center;font:800 12px/1 Manrope,system-ui,sans-serif;flex-shrink:0;">'+dd+'</span>'+
            '<span style="flex:1;min-width:0;font:700 12.5px/1.25 Manrope,system-ui,sans-serif;color:#16313A;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+h.name+'</span>'+
            '<span style="font:700 11px/1 Manrope,system-ui,sans-serif;color:#0E7C88;flex-shrink:0;display:inline-flex;align-items:center;gap:3px;">Tabrik<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg></span>'+
          '</button>';
        });
        html += '</div>';
      }
      calWrap.innerHTML = html;
      calWrap.querySelector('[data-cal-prev]').addEventListener('click', function(){ calMonth--; if(calMonth<0){calMonth=11;calYear--;} renderCal(); });
      calWrap.querySelector('[data-cal-next]').addEventListener('click', function(){ calMonth++; if(calMonth>11){calMonth=0;calYear++;} renderCal(); });
      calWrap.querySelectorAll('[data-cal-day]').forEach(function(el){
        el.addEventListener('click', function(){ selectHoliday(el.getAttribute('data-cal-day')); });
      });
    }
    renderCal();

    // send → confirmation state
    var sendBtn = box.querySelector('[data-sms-send]');
    sendBtn.addEventListener('click', function(){
      if(!ta.value.trim()){ ta.style.borderColor='#E5484D'; ta.focus(); return; }
      sendBtn.innerHTML = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Yuborildi';
      sendBtn.style.background = '#1AA565';
      sendBtn.disabled = true;
      setTimeout(close, 900);
    });

    recount();
    ov.appendChild(box);
    document.body.appendChild(ov);
  }
  window.wasytOpenSms = openSmsModal;

  /* ---------- SMS button ---------- */
  var SMS_ICON = '<svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M5 3.5h14a3 3 0 0 1 3 3v7.2a3 3 0 0 1-3 3H9.6l-3.5 3a0.7 0.7 0 0 1-1.16-0.54v-2.46H5a3 3 0 0 1-3-3V6.5a3 3 0 0 1 3-3z" fill="#5B6472"/><text x="12" y="11.7" font-size="6.4" font-weight="800" fill="#fff" text-anchor="middle" font-family="Manrope,system-ui,sans-serif" letter-spacing="0.3">SMS</text></svg>';
  function ensureSms(){
    var headers = document.querySelectorAll('header');
    for (var h=0; h<headers.length; h++){
      var header = headers[h];
      var have = header.querySelectorAll('[data-wasyt-sms]');
      for (var k=1;k<have.length;k++){ if(have[k].parentNode) have[k].parentNode.removeChild(have[k]); }
      if (have.length >= 1) continue;
      // sit just after the moon toggle (before the profile avatar)
      var moon = header.querySelector('[data-wasyt-theme]');
      if (!moon || !moon.parentNode) continue;
      var btn = document.createElement('button');
      btn.className='wasyt-theme-toggle'; btn.setAttribute('data-wasyt-sms','1'); btn.type='button';
      btn.setAttribute('title','SMS xabarlar');
      btn.innerHTML = SMS_ICON;
      btn.style.position = 'relative';
      var uc = upcomingHolidays(HOLI_WINDOW).length;
      if (uc > 0){
        var badge = document.createElement('span');
        badge.setAttribute('data-wasyt-smsbadge','1');
        badge.textContent = uc;
        badge.style.cssText = 'position:absolute;top:-3px;right:-3px;min-width:16px;height:16px;padding:0 3px;box-sizing:border-box;border-radius:9px;background:#E5484D;color:#fff;font:800 10px/16px Manrope,system-ui,sans-serif;text-align:center;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.25);pointer-events:none;';
        btn.appendChild(badge);
      }
      btn.addEventListener('click', function(e){ e.preventDefault(); window.location.href = 'Wasyt - SMS xabarlar.dc.html'; });
      moon.parentNode.insertBefore(btn, moon.nextSibling);
    }
  }

  /* ---------- holiday reminder toast (SMS tugmasi tepasida) ---------- */
  var holiToastShown = false;
  function showHoliToast(){
    if (holiToastShown) return;
    var up = upcomingHolidays(HOLI_WINDOW);
    if (!up.length) return;
    var h = up[0];
    var dismissed = '', seen = '';
    try { dismissed = localStorage.getItem('wasyt-holi-dismiss') || ''; } catch(e){}
    try { seen = sessionStorage.getItem('wasyt-holi-seen') || ''; } catch(e){}
    if (dismissed === h.key || seen === h.key) return;
    if (document.querySelector('[data-wasyt-holitoast]')) return;
    holiToastShown = true;
    try { sessionStorage.setItem('wasyt-holi-seen', h.key); } catch(e){}
    var dateStr = h.date.getDate()+'-'+SMS_MONTHS[h.date.getMonth()].toLowerCase();
    var daysStr = h.days===0 ? 'Bugun' : (h.days===1 ? 'Ertaga' : (h.days+' kun qoldi'));
    var t = document.createElement('div');
    t.setAttribute('data-wasyt-holitoast','1');
    t.style.cssText = 'position:fixed;top:74px;right:22px;z-index:99998;width:322px;max-width:calc(100vw - 44px);background:#fff;border:1px solid #EAEDF0;border-radius:16px;box-shadow:0 18px 50px rgba(16,32,40,.22);font-family:Manrope,system-ui,sans-serif;overflow:hidden;transform:translateY(-10px);opacity:0;transition:transform .28s cubic-bezier(.2,.8,.2,1),opacity .28s;';
    t.innerHTML =
      '<div style="display:flex;align-items:flex-start;gap:12px;padding:15px 15px 13px;">'+
        '<span style="width:38px;height:38px;border-radius:11px;background:#FDECEC;color:#E5484D;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg></span>'+
        '<div style="flex:1;min-width:0;">'+
          '<div style="font:800 13.5px/1.2 Manrope,system-ui,sans-serif;color:#16313A;">Yaqinlashayotgan bayram</div>'+
          '<div style="font:800 13.5px/1.3 Manrope,system-ui,sans-serif;color:#E5484D;margin-top:4px;">'+h.name+'</div>'+
          '<div style="font:600 11.5px/1.3 Manrope,system-ui,sans-serif;color:#9AA3AE;margin-top:2px;">'+dateStr+' · '+daysStr+'</div>'+
        '</div>'+
        '<button data-holi-x style="width:26px;height:26px;border:none;border-radius:8px;background:#F2F4F6;color:#8A96A3;cursor:pointer;font-size:17px;line-height:1;display:flex;align-items:center;justify-content:center;flex-shrink:0;">&times;</button>'+
      '</div>'+
      '<button data-holi-go style="width:100%;border:none;padding:12px;font:800 12.5px/1 Manrope,system-ui,sans-serif;color:#fff;background:linear-gradient(135deg,#0E7C88,#14A0AE);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>Mijozlarga tabrik yuborish</button>';
    document.body.appendChild(t);
    requestAnimationFrame(function(){ t.style.transform='translateY(0)'; t.style.opacity='1'; });
    function remove(){ t.style.transform='translateY(-10px)'; t.style.opacity='0'; setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); }, 280); }
    t.querySelector('[data-holi-x]').addEventListener('click', function(){ try{ localStorage.setItem('wasyt-holi-dismiss', h.key); }catch(e){} remove(); });
    t.querySelector('[data-holi-go]').addEventListener('click', function(){ remove(); window.location.href = 'Wasyt - SMS xabarlar.dc.html'; });
  }

  /* ---------- boot ---------- */
  var stored = 'light';
  try { stored = localStorage.getItem(KEY) || 'light'; } catch(e){}
  injectStyle();

  function boot(){
    injectStyle();
    ensureButton();
    if (stored === 'dark') setDark(true, false);
    else refreshIcons();
    setTimeout(showHoliToast, 1200);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  // DC renders async — re-apply on a short, BOUNDED schedule, then stop
  // (no perpetual observer: it can keep the preview from ever going idle)
  var tries = 0;
  var iv = setInterval(function(){
    tries++;
    ensureButton();
    ensureOrder();
    if (H.classList.contains('wasyt-dark')) walk(document.body, darkenEl);
    if (tries >= 18) clearInterval(iv);
  }, 200);
})();
