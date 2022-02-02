module.exports = {
  content: [
    "./src/**/*.{ts,tsx,js,jsx}",
    "./src/components/**/*.{ts,tsx,js,jsx}",
    "./src/components/*.{ts,tsx,js,jsx}",
    "components/**/*.{js,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")],
}
