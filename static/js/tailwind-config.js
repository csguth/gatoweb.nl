// Shared Tailwind CDN config for index.html, facturen.html and account.html.
// Superset of all three pages' previous per-page configs (facturen/account didn't use
// the pink palette or the custom fontFamily, but having them present is harmless).
tailwind.config = {
  theme: {
    extend: {
      colors: {
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
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
    }
  }
}
