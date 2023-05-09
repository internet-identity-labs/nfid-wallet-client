const defaultTheme = require("tailwindcss/defaultTheme")

const fontSize = {
  titleLarge: [
    "54px",
    {
      lineHeight: "64px",
    },
  ],
  title: [
    "42px",
    {
      lineHeight: "50px",
    },
  ],
  titleMobile: [
    "32px",
    {
      lineHeight: "40px",
    },
  ],
}

const fontFamily = {
  ...defaultTheme.fontFamily,
  sans: ["Inter", ...defaultTheme.fontFamily.sans],
  mono: ["IBM Plex Mono", ...defaultTheme.fontFamily.mono],
}

const dropShadow = {
  blue: "0 0px 2px rgba(14,98,255,1)",
}

const boxShadow = {
  black: "0 3px 10px rgba(59,62,67,0.4)",
  blueLight: "0 3px 10px rgba(32,121,255,0.4)",
  red: "0 0px 2px rgba(234,26,26,1)",
  sm: "0 1px 5px 0 rgb(0 0 0 / 0.05)",
  DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 3px 10px 0 rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 6px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 9px 20px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  none: "none",
  screen: " 0px 20px 50px rgba(0, 0, 0, 0.05)",
}

const blur = {
  "4xl": "80px",
  "5xl": "96px",
  "6xl": "112px",
  "7xl": "128px ",
}

const keyframes = {
  "fade-in": {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  "snuggle-up": {
    from: {
      opacity: 0,
      transform: "translate(-50%, -48%) scale(0.96)",
    },
    to: {
      opacity: 1,
      transform: "translate(-50%, -50%) scale(1)",
    },
  },
}

const animation = {
  "fade-in": "fade-in 500ms cubic-bezier(0.16, 1, 0.3, 1)",
  "snuggle-up": "snuggle-up 500ms cubic-bezier(0.16, 1, 0.3, 1)",
}

module.exports = {
  animation,
  blur,
  fontSize,
  fontFamily,
  dropShadow,
  boxShadow,
  keyframes,
}
