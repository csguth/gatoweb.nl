// Shared Tailwind CDN config for every page.
//
// `brand` is the design system from Lígia's Canva specs (issues #137 / #149). Each
// colour is annotated with the role it plays in her design.
tailwind.config = {
  theme: {
    extend: {
      colors: {
        brand: {
          ink:     '#3D0C11', // hero/menu background, dark sections
          plum:    '#530B2C', // "behaviour consultation" tag
          wine:    '#740A1E', // "About Lígia" title, senior-cats tag
          crimson: '#7E0001', // "How does a visit work?" headings and arrows
          red:     '#B83C4E', // primary brand red
          blush:   '#F1ACB1', // 2-visits card, kittens tag, "Book a visit" button
          rose:    '#E5A8B8', // pink section background
          cream:   '#F4F1EA', // off-white page background / text on dark
          sand:    '#EEE8DC', // beige buttons
          // The design puts the WhatsApp button's label and icon in moss on a sand
          // pill. At its original lightness that pairing is only 2.98:1, so `deep` is
          // the same hue/saturation darkened to clear WCAG AA (4.6:1) for text.
          moss:    { DEFAULT: '#6C8D84', deep: '#546D68' },
          grey:    '#B4B4B4',
        },
        // Third-party brand colour, kept out of `brand` on purpose: it belongs to
        // WhatsApp, not to Gato Catsit. Used for the "open WhatsApp" affordances.
        whatsapp: '#25D366',
      },
      fontFamily: {
        // Brand typography (#137). Anton stands in for the Canva font "Extend 50 Mega"
        // and Nunito for "Bubblebody Neue" — both SIL OFL and self-hosted (/fonts).
        display: ['Anton', '"Arial Narrow"', 'system-ui', 'sans-serif'],
        sans:    ['Nunito', 'system-ui', 'sans-serif'],
      },
    }
  }
}
