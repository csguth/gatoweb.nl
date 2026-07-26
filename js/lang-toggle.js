// Shared Alpine component for the EN/NL bilingual toggle, used on <body> of
// index.html, facturen.html and account.html: x-data="langToggle()" x-init="init()".
// Reads/writes the shared localStorage key 'gatoweb_lang' and toggles language
// classes on <body> (`show-nl`, `show-pt`) that css/site.css uses for visibility.
function langToggle() {
  const normalizeLang = (val) => {
    if (window.__gatoI18n && typeof window.__gatoI18n.normalizeLanguage === 'function') {
      return window.__gatoI18n.normalizeLanguage(val);
    }
    const v = String(val || '').toLowerCase();
    if (v.startsWith('nl')) return 'nl';
    if (v.startsWith('pt')) return 'pt';
    return 'en';
  };

  const stored = localStorage.getItem('gatoweb_lang');
  return {
    lang: normalizeLang(stored || navigator.language),
    init() {
      const applyBodyClass = (lang) => {
        document.body.classList.toggle('show-nl', lang === 'nl');
        document.body.classList.toggle('show-pt', lang === 'pt');
      };

      applyBodyClass(this.lang);
      if (window.__gatoI18n && typeof window.__gatoI18n.init === 'function') {
        window.__gatoI18n.init()
          .then(() => {
            const resolvedLang = window.__gatoI18n.getLanguage();
            if (this.lang !== resolvedLang) this.lang = resolvedLang;
            applyBodyClass(resolvedLang);
          })
          .catch((error) => {
            console.error('Could not initialize i18n runtime', error);
          });
      }

      this.$watch('lang', val => {
        const normalized = normalizeLang(val);
        applyBodyClass(normalized);
        localStorage.setItem('gatoweb_lang', normalized);
        if (window.__gatoI18n && typeof window.__gatoI18n.setLanguage === 'function') {
          window.__gatoI18n.setLanguage(normalized).catch((error) => {
            console.error('Could not change i18n language', error);
          });
        }
      });
    }
  };
}
