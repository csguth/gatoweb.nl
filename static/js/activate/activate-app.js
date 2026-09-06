// activateApp() Alpine component for the /activate/ bridge page (issue #173
// follow-up). Lígia's invite link (client-invite Edge Function) points here
// instead of straight at Supabase's one-time verify link, wrapping the real
// link in a `verify` query parameter — see buildActivationUrl() in
// supabase/functions/client-invite/logic.js for why: GoTrue links are
// single-use, and WhatsApp's own link-preview crawler fetching the raw link
// to build a chat preview card would silently burn it before the client
// ever clicks it themselves.
//
// This page is deliberately static and Supabase-free: it just decodes the
// `verify` parameter (resolveActivationLink(), ./activation-link.js) and
// renders it as a real <a href> for the client to click — a link-preview
// crawler fetches this page's HTML for its Open Graph tags but never
// *follows* the link it finds inside, so the sensitive one-time token is
// only ever consumed by an actual human clicking the button, right before
// landing on /account/ already authenticated.
import { resolveActivationLink } from './activation-link.js';

const t = (key, options) => window.t(key, options);

window.activateApp = function () {
  return {
    activationLink: null,
    // Runtime t() strings fall back to the raw key until i18next finishes
    // its async init (static/js/i18n.js) — everywhere else in this codebase
    // that's invisible because the t()-dependent text only ever appears
    // after some later user action, by which point i18n has long since
    // loaded. This page's "link missing/invalid" message can render on the
    // very first paint instead, so `ready` exists purely to give Alpine a
    // reactive dependency to re-evaluate missingLinkMessage() against once
    // i18next actually becomes available.
    ready: false,

    async init() {
      const params = new URLSearchParams(window.location.search);
      this.activationLink = resolveActivationLink(params.get('verify'));
      if (window.__gatoI18n) await window.__gatoI18n.init();
      this.ready = true;
    },

    get invalidLink() {
      return this.activationLink === null;
    },

    missingLinkMessage() {
      return this.ready ? t('activate.missing_link') : '';
    }
  };
};
