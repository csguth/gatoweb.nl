// Client-side half of the legacy /facturen.html and /account.html redirect stubs.
//
// Those stubs carry a <meta http-equiv="refresh"> to the English page so the redirect
// still works (and stays crawlable) without JavaScript. When JS is available we can do
// better: send the visitor to the language they actually use, derived from the same
// localStorage key the rest of the site uses.
//
// It runs from <head>, before the meta refresh fires, and replaces the history entry
// so the stub never shows up in the visitor's back button.
(function () {
  var supported = ['en', 'nl', 'pt'];
  var page = window.location.pathname.replace(/^.*\//, '').replace(/\.html$/, '');
  if (supported.indexOf(page) !== -1 || !page) return;

  var lang = null;
  try {
    var saved = localStorage.getItem('gatoweb_lang');
    if (saved && supported.indexOf(saved) !== -1) lang = saved;
  } catch (e) { /* localStorage unavailable — ignore. */ }

  if (!lang) {
    var langs = navigator.languages || [navigator.language || ''];
    for (var i = 0; i < langs.length && !lang; i += 1) {
      var code = (langs[i] || '').slice(0, 2).toLowerCase();
      if (supported.indexOf(code) !== -1) lang = code;
    }
  }

  // English is already the meta-refresh target, so only override for nl/pt.
  if (lang && lang !== 'en') window.location.replace('/' + lang + '/' + page + '/');
})();
