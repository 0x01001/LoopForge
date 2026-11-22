// Apply the language before paint; boot-theme.js owns the theme.
// i18n.js replaces this. Boot must still render if that script fails to load.
window.lfT = window.lfT || ((zh) => zh);
(() => {
  const root = document.documentElement;
  let lang = 'zh';
  try {
    const stored = localStorage.getItem('loopforge.lang');
    lang = stored === 'en' || stored === 'vi' ? stored : 'zh';
  } catch { lang = 'zh'; }
  root.dataset.lang = lang;
  root.lang = lang === 'zh' ? 'zh-CN' : lang;
  try {
    if (sessionStorage.getItem('loopforge.lang.motion') === 'in') {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) sessionStorage.removeItem('loopforge.lang.motion');
      else root.classList.add('lang-enter');
    }
  } catch (_) { /* Enter animation is optional when storage is blocked. */ }
})();
