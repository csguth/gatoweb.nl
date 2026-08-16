// Compile-time i18n means each language has its own URL (/en/, /nl/, /pt/) and its
// own fully-rendered page. There is no client-side span toggling anymore.
//
// This tiny script keeps the visitor's saved language preference in sync with the
// page they're actually viewing: on every page load it writes the current <html lang>
// into localStorage. So navigating via the language selector (plain links to the other
// language's URL) automatically updates the stored preference, and the root redirect
// (js/root-redirect.js) reads the same key to send returning visitors straight to
// their language.
(function () {
  var lang = document.documentElement.lang;
  if (!lang) return;
  try {
    localStorage.setItem('gatoweb_lang', lang);
  } catch (e) {
    /* localStorage unavailable (private mode / disabled) — ignore. */
  }
})();
