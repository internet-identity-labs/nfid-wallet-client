module.exports = {
  content: ["./frontend/**/*.{ts,tsx}"],
  plugins: [
    require("@tailwindcss/forms"),
    require("./plugins/tailwind-ios-height"),
    require("./plugins/utilities-ui-kit"),
  ],
}
