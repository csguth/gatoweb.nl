// Root redirect for "/" (bare domain). Because the site is multilingual with
// defaultContentLanguageInSubdir=true, there is no content at the root — every
// language lives under /en/, /nl/ or /pt/. This script picks the best language for
// the visitor and redirects there:
//   1. their previously saved preference (localStorage.gatoweb_lang), else
//   2. their browser language (navigator languages), else
//   3. English as the fallback.
//
// The storage key is deliberately the same one the old client-side toggle used, so
// visitors who already picked a language keep it across the Hugo migration.
(function () {
  var supported = ['en', 'nl', 'pt'];

  function fromStorage() {
    try {
      var saved = localStorage.getItem('gatoweb_lang');
      if (saved && supported.indexOf(saved) !== -1) return saved;
    } catch (e) { /* localStorage unavailable (private mode / disabled) — ignore. */ }
    return null;
  }

  function fromBrowser() {
    var langs = navigator.languages || [navigator.language || ''];
    for (var i = 0; i < langs.length; i += 1) {
      var code = (langs[i] || '').slice(0, 2).toLowerCase();
      if (supported.indexOf(code) !== -1) return code;
    }
    return null;
  }

  var lang = fromStorage() || fromBrowser() || 'en';

  // Carry the query string and fragment across the redirect. Supabase Auth sends users
  // back to a URL with its state appended — `#access_token=…` / `#error=…` for the
  // implicit flow, `?code=…` for PKCE — and it falls back to the project's Site URL
  // (this bare root) whenever the e-mail link's redirect_to isn't on the allow list, or
  // for any older confirmation e-mail still pointing here. Dropping them would silently
  // throw the session away and leave the client stuck at "confirm your e-mail", so
  // everything after the path is forwarded verbatim to the language page, which runs
  // supabase-js with detectSessionInUrl (see js/index/client-auth.js).
  window.location.replace('/' + lang + '/' + window.location.search + window.location.hash);
})();
