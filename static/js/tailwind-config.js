// Shared Tailwind CDN config for every page.
//
// `brand` is the design system from Lígia's Canva specs (see issue #137). The older
// sage/warm/pink palette is the previous identity and is still referenced by the
// existing markup; it goes away once #149 has migrated every page to `brand`.
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
          moss:    '#6C8D84', // WhatsApp button
          grey:    '#B4B4B4',
        },
        sage: {
          50:  '#f5f5f4',
          100: '#e7e6e3',
          200: '#c8c6c0',
          300: '#a3a099',
          400: '#726e64',
          500: '#453f34',
          600: '#221f19',
          700: '#141210',
          800: '#0a0908',
          900: '#000000',
        },
        warm: {
          50:  '#faf7f0',
          100: '#f2ebd9',
          200: '#eee8dc',
          300: '#e0cba0',
          400: '#f8974a',
          500: '#fa7d18',
          600: '#e2620a',
          700: '#bb4a09',
          800: '#943a0f',
          900: '#78320f',
        },
        pink: {
          50:  '#fdf2f8',
          100: '#fbe3f0',
          200: '#f2bfdf',
          300: '#e594c0',
          400: '#c85a95',
          500: '#a13574',
          600: '#7f1856',
          700: '#671347',
          800: '#500e38',
          900: '#3a0a29',
        }
      },
      fontFamily: {
        // Brand typography (#137). Anton stands in for the Canva font "Extend 50 Mega"
        // and Nunito for "Bubblebody Neue" — both SIL OFL and self-hosted (/fonts).
        display: ['Anton', '"Arial Narrow"', 'system-ui', 'sans-serif'],
        sans:    ['Nunito', 'system-ui', 'sans-serif'],
        // `serif` is aliased to the display face so the existing `font-serif` headings
        // pick up the new brand font untouched. #149 renames them to `font-display`,
        // after which this alias can go.
        serif:   ['Anton', '"Arial Narrow"', 'system-ui', 'sans-serif'],
      },
    }
  }
}
