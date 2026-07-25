// Shared i18n runtime (EN/NL/PT) for JavaScript strings across pages.
(function () {
  const STORAGE_KEY = 'gatoweb_lang';
  const DEFAULT_LANG = 'en';
  const SUPPORTED_LANGS = ['en', 'nl', 'pt'];
  let initPromise = null;

  function normalizeLanguage(lang) {
    if (!lang) return DEFAULT_LANG;
    const normalized = String(lang).toLowerCase().split('-')[0];
    return SUPPORTED_LANGS.indexOf(normalized) !== -1 ? normalized : DEFAULT_LANG;
  }

  function getPreferredLanguage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return normalizeLanguage(stored);
    return normalizeLanguage(navigator.language);
  }

  async function loadResources() {
    const resources = {};
    for (const lang of SUPPORTED_LANGS) {
      const response = await fetch('locales/' + lang + '.json');
      if (!response.ok) {
        throw new Error('Failed to load locale file: locales/' + lang + '.json');
      }
      resources[lang] = { translation: await response.json() };
    }
    return resources;
  }

  async function init() {
    if (initPromise) return initPromise;
    initPromise = (async function () {
      if (!window.i18next) {
        throw new Error('i18next global not found');
      }
      const resources = await loadResources();
      const lang = getPreferredLanguage();
      await window.i18next.init({
        lng: lang,
        fallbackLng: DEFAULT_LANG,
        resources: resources,
        interpolation: { escapeValue: false }
      });
      document.documentElement.lang = window.i18next.language;
      document.dispatchEvent(new CustomEvent('gato:i18n-ready', { detail: { language: window.i18next.language } }));
      return window.i18next.language;
    })();
    return initPromise;
  }

  async function setLanguage(lang) {
    await init();
    const normalized = normalizeLanguage(lang);
    await window.i18next.changeLanguage(normalized);
    localStorage.setItem(STORAGE_KEY, normalized);
    document.documentElement.lang = normalized;
    document.dispatchEvent(new CustomEvent('gato:language-changed', { detail: { language: normalized } }));
    return normalized;
  }

  function getLanguage() {
    if (window.i18next && window.i18next.isInitialized) {
      return normalizeLanguage(window.i18next.language);
    }
    return getPreferredLanguage();
  }

  function t(key, options) {
    if (window.i18next && window.i18next.isInitialized) {
      return window.i18next.t(key, options);
    }
    return key;
  }

  window.__gatoI18n = {
    init: init,
    t: t,
    setLanguage: setLanguage,
    getLanguage: getLanguage,
    normalizeLanguage: normalizeLanguage
  };
  window.t = t;
})();
