module.exports = {
  content: [
    "./src/**/*.{ts,tsx,js,jsx}",
    "./src/components/**/*.{ts,tsx,js,jsx}",
    "./src/components/*.{ts,tsx,js,jsx}",
    "components/**/*.{js,ts,tsx}",
  ],
  plugins: [
    require("@tailwindcss/forms"),
    require("../../plugins/utilities-ui-kit"),
  ],
}
