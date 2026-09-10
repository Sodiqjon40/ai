(function () {
  var KEY = 'wasytNavCollapsed', H = document.documentElement;

  // --- apply collapsed state from storage (runs every load) ---
  if (localStorage.getItem(KEY) === '1') H.classList.add('nav-collapsed');
  else H.classList.remove('nav-collapsed');

  if (window.__wasytNavInit) return;
  window.__wasytNavInit = true;

  function norm(s) { return (s || '').replace(/\s+/g, ' ').trim().toLowerCase(); }
  function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  var LANG = (function () { try { return localStorage.getItem('wasyt_lang') || 'uz'; } catch (e) { return 'uz'; } })();
  function lab(s) { return (LANG === 'ru' && s.ru) ? s.ru : s.label; }

  // --- section sub-category map (label = uz, ru = russian) ---
  var SECTIONS = {
    "Wasyt - Bosh sahifa.dc.html": { title: "Bosh sahifa", subs: [] },
    "Wasyt - Savdo.dc.html": { title: "Savdo", subs: [
      { label: "Yangi savdo", ru: "\u041d\u043e\u0432\u0430\u044f \u043f\u0440\u043e\u0434\u0430\u0436\u0430", nav: "pos" },
      { label: "Barcha sotuvlar", ru: "\u0412\u0441\u0435 \u043f\u0440\u043e\u0434\u0430\u0436\u0438", nav: "sotuv" },
      { label: "Kassa smenalari", ru: "\u041a\u0430\u0441\u0441\u043e\u0432\u044b\u0435 \u0441\u043c\u0435\u043d\u044b", nav: "shift" },
      { label: "Kassa operatsiyalari", ru: "\u041a\u0430\u0441\u0441\u043e\u0432\u044b\u0435 \u043e\u043f\u0435\u0440\u0430\u0446\u0438\u0438", nav: "cashop" } ] },
    "Wasyt - Konsultant.dc.html": { title: "Sotuvchi", subs: [
      { label: "Yangi tanlov", ru: "\u041d\u043e\u0432\u044b\u0439 \u043f\u043e\u0434\u0431\u043e\u0440", nav: "new" },
      { label: "Mening savatlarim", ru: "\u041c\u043e\u0438 \u043a\u043e\u0440\u0437\u0438\u043d\u044b", nav: "list" } ] },
    "Wasyt - Mahsulotlar.dc.html": { title: "Mahsulotlar", subs: [
      { label: "Barcha mahsulotlar", ru: "\u0412\u0441\u0435 \u0442\u043e\u0432\u0430\u0440\u044b", nav: "all" },
      { label: "Kiruvchi", ru: "\u0412\u0445\u043e\u0434\u044f\u0449\u0438\u0439", nav: "in" },
      { label: "Hisobdan o'chirish", ru: "\u0421\u043f\u0438\u0441\u0430\u043d\u0438\u0435", nav: "off" },
      { label: "Narxli mahsulotlar", ru: "\u041e\u0446\u0435\u043d\u0451\u043d\u043d\u044b\u0435 \u0442\u043e\u0432\u0430\u0440\u044b", nav: "price" } ] },
    "Wasyt - Mijozlar.dc.html": { title: "Mijozlar", subs: [
      { label: "Barcha mijozlar", ru: "\u0412\u0441\u0435 \u043a\u043b\u0438\u0435\u043d\u0442\u044b", nav: "all" },
      { label: "Qarzdor mijozlar", ru: "\u041a\u043b\u0438\u0435\u043d\u0442\u044b \u0441 \u0434\u043e\u043b\u0433\u043e\u043c", nav: "debt" },
      { label: "Qarz to'lovlari", ru: "\u041f\u043b\u0430\u0442\u0435\u0436\u0438 \u043f\u043e \u0434\u043e\u043b\u0433\u0430\u043c", nav: "pay" } ] },
    "Wasyt - Ta'minotchilar.dc.html": { title: "Ta'minotchilar", subs: [
      { label: "Ro'yxat", ru: "\u0421\u043f\u0438\u0441\u043e\u043a", nav: "royxat" },
      { label: "Vazvrat (qaytarish)", ru: "\u0412\u043e\u0437\u0432\u0440\u0430\u0442", nav: "vazvrat" } ] },
    "Wasyt - Ombor.dc.html": { title: "Ombor", subs: [
      { label: "Barcha omborlar", ru: "\u0412\u0441\u0435 \u0441\u043a\u043b\u0430\u0434\u044b", nav: "stock" },
      { label: "Inventarizatsiya", ru: "\u0418\u043d\u0432\u0435\u043d\u0442\u0430\u0440\u0438\u0437\u0430\u0446\u0438\u044f", nav: "inv" },
      { label: "Transfer", ru: "\u0422\u0440\u0430\u043d\u0441\u0444\u0435\u0440", nav: "transfer" } ] },
    "Wasyt - Moliya.dc.html": { title: "Moliya", subs: [
      { label: "Moliya paneli", ru: "\u0424\u0438\u043d\u0430\u043d\u0441\u043e\u0432\u0430\u044f \u043f\u0430\u043d\u0435\u043b\u044c", nav: "dash" },
      { label: "Moliyaviy kategoriyalar", ru: "\u0424\u0438\u043d\u0430\u043d\u0441\u043e\u0432\u044b\u0435 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438", nav: "cats" },
      { label: "Moliyaviy tranzaksiyalar", ru: "\u0424\u0438\u043d\u0430\u043d\u0441\u043e\u0432\u044b\u0435 \u0442\u0440\u0430\u043d\u0437\u0430\u043a\u0446\u0438\u0438", nav: "txns" },
      { label: "Hisoblar holati", ru: "\u0421\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435 \u0441\u0447\u0435\u0442\u043e\u0432", nav: "accounts" } ] },
    "Wasyt - Video darslik.dc.html": { title: "Video darslik", subs: [] },
    "Wasyt - SMS xabarlar.dc.html": { title: "SMS xabarlar", subs: [] },
    "Wasyt - Hisobotlar.dc.html": { title: "Hisobotlar", subs: [
      { label: "Tanlangan", ru: "\u0418\u0437\u0431\u0440\u0430\u043d\u043d\u044b\u0435", nav: "tanlangan" },
      { label: "Do'kon", ru: "\u041c\u0430\u0433\u0430\u0437\u0438\u043d", nav: "dokon" },
      { label: "Mahsulot", ru: "\u0422\u043e\u0432\u0430\u0440\u044b", nav: "mahsulot" },
      { label: "Sotuvchi", ru: "\u041f\u0440\u043e\u0434\u0430\u0432\u0446\u044b", nav: "sotuvchi" },
      { label: "Mijoz", ru: "\u041a\u043b\u0438\u0435\u043d\u0442\u044b", nav: "mijoz" } ] },
    "Wasyt - Sozlamalar.dc.html": { title: "Sozlamalar", subs: [
      { label: "Do'kon ma'lumotlari", ru: "\u0414\u0430\u043d\u043d\u044b\u0435 \u043c\u0430\u0433\u0430\u0437\u0438\u043d\u0430", nav: "store" },
      { label: "Kassa va to'lov", ru: "\u041a\u0430\u0441\u0441\u0430 \u0438 \u043e\u043f\u043b\u0430\u0442\u0430", nav: "payment" },
      { label: "Chek", ru: "\u0427\u0435\u043a", nav: "receipt" },
      { label: "Cennik", ru: "\u0426\u0435\u043d\u043d\u0438\u043a", nav: "cennik" },
      { label: "Tarif", ru: "\u0422\u0430\u0440\u0438\u0444", nav: "tarif" },
      { label: "Xodimlar", ru: "\u0421\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u0438", nav: "staff" },
      { label: "Bildirishnomalar", ru: "\u0423\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u044f", nav: "notify" },
      { label: "Video darslik", ru: "\u0412\u0438\u0434\u0435\u043e\u0443\u0440\u043e\u043a\u0438", nav: "video", file: "Wasyt - Video darslik.dc.html" } ] }
  };
  // label (uz title or ru) -> file, for items rendered as plain <button> with no href
  var L2F = {};
  Object.keys(SECTIONS).forEach(function (f) { L2F[norm(SECTIONS[f].title)] = f; });
  var RU = {
    "главная": "Wasyt - Bosh sahifa.dc.html", "продажи": "Wasyt - Savdo.dc.html",
    "товары": "Wasyt - Mahsulotlar.dc.html", "клиенты": "Wasyt - Mijozlar.dc.html",
    "поставщики": "Wasyt - Ta'minotchilar.dc.html", "склад": "Wasyt - Ombor.dc.html",
    "финансы": "Wasyt - Moliya.dc.html", "продавец": "Wasyt - Konsultant.dc.html", "отчёты": "Wasyt - Hisobotlar.dc.html",
    "отчеты": "Wasyt - Hisobotlar.dc.html", "настройки": "Wasyt - Sozlamalar.dc.html"
  };
  Object.keys(RU).forEach(function (k) { L2F[k] = RU[k]; });

  function fileFor(item) {
    var a = item.getAttribute && item.getAttribute('href');
    if (a) return decodeURIComponent(a.split('#')[0].split('?')[0]);
    return L2F[norm(item.textContent)] || null;
  }

  // --- toggle button ---
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.navtoggle');
    if (!t) return;
    var c = H.classList.toggle('nav-collapsed');
    try { localStorage.setItem(KEY, c ? '1' : '0'); } catch (err) {}
    hideFlyout(true);
  });

  // --- flyout ---
  var flyout = null, hideTimer = null;
  function makeFlyout() {
    if (flyout) return flyout;
    flyout = document.createElement('div');
    flyout.id = '__navfly';
    flyout.style.cssText = 'position:fixed; z-index:9999; min-width:212px; background:#fff; border:1px solid #EDEFF2; border-radius:14px; box-shadow:0 12px 34px rgba(16,24,40,.17); padding:8px; display:none; font-family:inherit;';
    flyout.addEventListener('mouseenter', function () { clearTimeout(hideTimer); });
    flyout.addEventListener('mouseleave', function () { hideFlyout(); });
    document.body.appendChild(flyout);
    return flyout;
  }
  function hideFlyout(now) {
    clearTimeout(hideTimer);
    if (now) { if (flyout) flyout.style.display = 'none'; return; }
    hideTimer = setTimeout(function () { if (flyout) flyout.style.display = 'none'; }, 130);
  }
  function showFlyoutFor(item) {
    if (!H.classList.contains('nav-collapsed')) return;
    var file = fileFor(item);
    if (!file) return;
    var sec = SECTIONS[file];
    if (!sec) return;
    var f = makeFlyout();
    clearTimeout(hideTimer);
    var title = norm(item.textContent) ? item.textContent.replace(/\s+/g, ' ').trim() : sec.title;
    var html = '<div style="padding:9px 12px 10px; font-size:14px; font-weight:800; color:#16313A;">' + esc(title) + '</div>';
    if (sec.subs.length) {
      html += '<div style="height:1px; background:#F2F4F6; margin:0 6px 6px;"></div>';
      sec.subs.forEach(function (s) {
        html += '<a href="' + encodeURI(s.file || file) + (s.file ? '' : '?nav=' + s.nav) + '" '
          + 'style="display:block; padding:9px 12px; border-radius:9px; font-size:13.5px; font-weight:600; color:#46535F; text-decoration:none; white-space:nowrap;" '
          + 'onmouseover="this.style.background=\'#F2F8F9\';this.style.color=\'#0E7C88\';" '
          + 'onmouseout="this.style.background=\'transparent\';this.style.color=\'#46535F\';">' + esc(lab(s)) + '</a>';
      });
    } else {
      html += '<a href="' + encodeURI(file) + '" '
        + 'style="display:block; padding:8px 12px; border-radius:9px; font-size:13px; font-weight:600; color:#0E7C88; text-decoration:none;">'
        + (LANG === 'ru' ? '\u041e\u0442\u043a\u0440\u044b\u0442\u044c' : 'Ochish') + '</a>';
    }
    f.innerHTML = html;
    f.style.display = 'block';
    var r = item.getBoundingClientRect();
    var h = f.offsetHeight;
    var top = r.top - 6;
    if (top + h > window.innerHeight - 10) top = Math.max(10, window.innerHeight - 10 - h);
    f.style.top = top + 'px';
    f.style.left = (r.right + 10) + 'px';
  }

  // --- wire hover on top-level nav items (document-level so it survives re-renders) ---
  document.addEventListener('mouseover', function (e) {
    var item = e.target.closest && e.target.closest('aside.navbar .navscroll > a, aside.navbar .navscroll > button, aside.navbar .navscroll .navgroup > button');
    if (!item) return;
    showFlyoutFor(item);
  });
  document.addEventListener('mouseout', function (e) {
    var sc = e.target.closest && e.target.closest('aside.navbar .navscroll');
    if (!sc) return;
    var to = e.relatedTarget;
    if (to && to.closest && (to.closest('aside.navbar .navscroll') || to.closest('#__navfly'))) return;
    hideFlyout();
  });

  // --- deep-link: ?nav=<key> clicks the matching in-page control after load ---
  function applyNavParam() {
    var p;
    try { p = new URLSearchParams(location.search).get('nav'); } catch (e) { p = null; }
    if (!p) return;
    var tries = 0;
    var iv = setInterval(function () {
      var el = document.querySelector('[data-nav="' + p + '"]');
      if (el) {
        clearInterval(iv);
        el.click();
        try { history.replaceState(null, '', location.pathname); } catch (e) {}
      } else if (++tries > 60) { clearInterval(iv); }
    }, 50);
  }
  applyNavParam();
})();
