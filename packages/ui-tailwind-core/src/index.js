const plugin = require("tailwindcss/plugin")
const colors = require("tailwindcss/colors")

const iosUtilities = require("./utils/ios")

module.exports = plugin(
  function ({ addUtilities, addComponents, theme }) {
    addUtilities(iosUtilities, ["responsive"])
    addComponents([require("./button/index")(theme)])
  },
  {
    theme: {
      extend: require("./theme"),
      colors: {
        transparent: "transparent",
        current: "currentColor",
        primary: { ...colors.blue, DEFAULT: colors.blue[600] },
        secondary: colors.black,
        black: colors.black,
        // FIXME: get rid of that. Just use `-black` instead
        "black-base": colors.black,
        white: colors.white,
        gray: { ...colors.gray, DEFAULT: colors.gray[600] },
        red: { ...colors.red, DEFAULT: colors.red[600] },
        orange: { ...colors.orange, DEFAULT: colors.orange[600] },
        amber: { ...colors.amber, DEFAULT: colors.amber[600] },
        green: { ...colors.green, DEFAULT: colors.green[600] },
        emerald: { ...colors.emerald, DEFAULT: colors.emerald[600] },
        teal: { ...colors.teal, DEFAULT: colors.teal[600] },
        cyan: { ...colors.cyan, DEFAULT: colors.cyan[600] },
        blue: { ...colors.blue, DEFAULT: colors.blue[600] },
        indigo: { ...colors.indigo, DEFAULT: colors.indigo[600] },
        violet: { ...colors.violet, DEFAULT: colors.violet[600] },
        purple: { ...colors.purple, DEFAULT: colors.purple[600] },
      },
    },
  },
)
