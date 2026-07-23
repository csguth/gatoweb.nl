// Shared Alpine component for the EN/NL bilingual toggle, used on <body> of
// index.html, facturen.html and account.html: x-data="langToggle()" x-init="init()".
// Reads/writes the shared localStorage key 'gatoweb_lang' and toggles the
// 'show-nl' class on <body>, which css/site.css uses to show/hide .en/.nl
// (and facturen.html's .en-l/.nl-l) spans.
function langToggle() {
  return {
    lang: localStorage.getItem('gatoweb_lang') || (navigator.language.startsWith('nl') ? 'nl' : 'en'),
    init() {
      document.body.classList.toggle('show-nl', this.lang === 'nl');
      this.$watch('lang', val => {
        document.body.classList.toggle('show-nl', val === 'nl');
        localStorage.setItem('gatoweb_lang', val);
      });
    }
  };
}
