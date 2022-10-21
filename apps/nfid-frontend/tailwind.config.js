const { createGlobPatternsForDependencies } = require('@nrwl/react/tailwind');
const { join } = require('path');
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    join(__dirname, './src/**/*.{ts,tsx}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  plugins: [
    require('@tailwindcss/forms'),
    require('@internet-identity-labs/nfid-ui-kit-core'),
  ],
  theme: {
    extend: {
      fontFamily: {
        ...defaultTheme.fontFamily,
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['IBM Plex Mono', ...defaultTheme.fontFamily.mono],
      },
      screens: {
        ...defaultTheme.screens,
        xs: '375px',
      },
    },
  },
};
