module.exports = {
  content: ["./frontend/**/*.{ts,tsx}"],
  theme: {
    extend: {
      spacing: {
        "13vw": "13vw",
        "20vw": "20vw",
        "16vh": "16vh",
        "30vh": "30vh",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("./plugins/tailwind-ios-height"),
    require("./plugins/utilities-ui-kit"),
  ],
}
