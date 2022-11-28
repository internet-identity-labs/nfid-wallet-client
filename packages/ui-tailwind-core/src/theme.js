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
  inter: ["Inter", "sans-serif"],
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
}

const blur = {
  "4xl": "80px",
  "5xl": "96px",
  "6xl": "112px",
  "7xl": "128px ",
}

module.exports = { blur, fontSize, fontFamily, dropShadow, boxShadow }
