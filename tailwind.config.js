module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  plugins: [
    require("@tailwindcss/forms"),
    require("./plugins/tailwind-ios-height"),
    require("./plugins/utilities-ui-kit"),
  ],
}
