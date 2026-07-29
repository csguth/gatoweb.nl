// Static HTML translation bridge: maps EN/NL span pairs to i18next keys so
// both static and dynamic strings come from the same locales/*.json source.
(function () {
  function pageKey() {
    const path = (window.location.pathname || '').toLowerCase();
    // Cloudflare Pages serves clean URLs (e.g. /facturen, no .html extension) via a
    // 308 redirect, so this must match both the raw filename and the extensionless path.
    if (path.endsWith('/account.html') || path.endsWith('account.html') || path.endsWith('/account')) return 'account';
    if (path.endsWith('/facturen.html') || path.endsWith('facturen.html') || path.endsWith('/facturen')) return 'facturen';
    return 'index';
  }

  function nextElementSibling(node) {
    let sibling = node.nextSibling;
    while (sibling) {
      if (sibling.nodeType === Node.TEXT_NODE) {
        if (sibling.textContent.trim() === '') {
          sibling = sibling.nextSibling;
          continue;
        }
        return null;
      }
      if (sibling.nodeType === Node.ELEMENT_NODE) {
        return sibling;
      }
      return null;
    }
    return null;
  }

  function collectPairs() {
    const elements = Array.from(document.querySelectorAll('.en, .nl, .pt, .en-l, .nl-l, .pt-l'));
    const consumed = new Set();
    const pairs = [];

    for (const element of elements) {
      if (consumed.has(element)) continue;
      const classes = new Set(element.classList);

      let variant = null;
      if (classes.has('en') || classes.has('nl') || classes.has('pt')) {
        variant = 'plain';
      } else if (classes.has('en-l') || classes.has('nl-l') || classes.has('pt-l')) {
        variant = 'l';
      }
      if (!variant) continue;

      const next = nextElementSibling(element);
      if (!next) continue;
      const nextClasses = new Set(next.classList);

      const enClass = variant === 'plain' ? 'en' : 'en-l';
      const nlClass = variant === 'plain' ? 'nl' : 'nl-l';
      const ptClass = variant === 'plain' ? 'pt' : 'pt-l';

      let enElement = null;
      let nlElement = null;
      if (classes.has(enClass) && nextClasses.has(nlClass)) {
        enElement = element;
        nlElement = next;
      } else if (classes.has(nlClass) && nextClasses.has(enClass)) {
        enElement = next;
        nlElement = element;
      } else {
        continue;
      }

      let ptElement = nextElementSibling(nlElement);
      if (!ptElement || !ptElement.classList.contains(ptClass)) {
        ptElement = null;
      }

      consumed.add(enElement);
      consumed.add(nlElement);
      if (ptElement) consumed.add(ptElement);
      pairs.push({ enElement, nlElement, ptElement });
    }

    return pairs;
  }

  function applyStaticTranslations() {
    if (!window.i18next || !window.i18next.isInitialized) return;
    const baseKey = 'static.' + pageKey();
    const pairs = collectPairs();

    for (let i = 0; i < pairs.length; i += 1) {
      // Each translated element is tagged with data-i18n="section.slug" at
      // authoring time (see the enElement). Falling back to the old
      // positional key keeps things working for any pair that hasn't been
      // tagged yet.
      const explicitKey = pairs[i].enElement.getAttribute('data-i18n');
      const key = explicitKey ? baseKey + '.' + explicitKey : baseKey + '.k' + String(i + 1).padStart(3, '0');
      const translated = window.i18next.t(key);
      pairs[i].enElement.innerHTML = translated;
      pairs[i].nlElement.innerHTML = translated;
      if (pairs[i].ptElement) pairs[i].ptElement.innerHTML = translated;
    }
  }

  window.__gatoApplyStaticTranslations = applyStaticTranslations;
  document.addEventListener('gato:i18n-ready', applyStaticTranslations);
  document.addEventListener('gato:language-changed', applyStaticTranslations);
  document.addEventListener('DOMContentLoaded', applyStaticTranslations);
})();
