module.exports = {
  content: ["./**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },

  plugins: [
    require("@tailwindcss/forms"),
    require("../../plugins/utilities-ui-kit"),
  ],
}
