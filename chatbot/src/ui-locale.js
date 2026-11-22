// Same overlay as web/i18n.js. The chatbot is a separate document, so it
// cannot see the shell's translator; it loads the same scripts and key.
const LANGS = ["zh", "en", "vi"];

export function uiLang(storage = localStorage) {
  try {
    const value = storage.getItem("loopforge.lang");
    return LANGS.includes(value) ? value : "zh";
  } catch {
    return "zh";
  }
}

export function applyUiLocale(lang = uiLang()) {
  const root = document.documentElement;
  root.dataset.lang = lang;
  root.lang = lang === "zh" ? "zh-CN" : lang;
  if (lang === "zh" || window.lfTranslate) return Promise.resolve();
  const dict = lang === "vi" ? "/i18n-vi.js" : "/i18n-en.js";
  return loadScript(dict).then(() => loadScript("/i18n.js"));
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(src));
    document.head.append(script);
  });
}
