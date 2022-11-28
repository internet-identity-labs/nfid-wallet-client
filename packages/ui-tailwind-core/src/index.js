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
        primary: colors.blue,
        secondary: colors.black,
        black: colors.black,
        // FIXME: get rid of that. Just use `-black` instead
        "black-base": colors.black,
        white: colors.white,
        gray: colors.gray,
        red: {
          ...colors.red,
          base: colors.red[600],
        },
        orange: colors.orange,
        amber: colors.amber,
        green: colors.green,
        emerald: colors.emerald,
        teal: colors.teal,
        cyan: colors.cyan,
        blue: colors.blue,
        indigo: colors.indigo,
        violet: colors.violet,
        purple: colors.purple,
      },
    },
  },
)
