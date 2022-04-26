const defaultTheme = require("tailwindcss/defaultTheme")

module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  plugins: [
    require("@tailwindcss/forms"),
    require("@internet-identity-labs/nfid-ui-kit-core"),
  ],
  theme: {
    extend: {
      fontFamily: {
        ...defaultTheme.fontFamily,
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        mono: ["IBM Plex Mono", ...defaultTheme.fontFamily.mono],
      },
      screens: {
        ...defaultTheme.screens,
        xs: "375px",
      },
    },
  },
}
