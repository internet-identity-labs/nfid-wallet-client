const defaultTheme = require("tailwindcss/defaultTheme")

module.exports = {
  content: ["./src/**/*.{ts,tsx}", "./public/**/*.{html,svg}"],
  plugins: [
    require("@tailwindcss/forms"),
    require("@internet-identity-labs/nfid-ui-kit-core"),
  ],
  theme: {
    extend: {
      backgroundImage: {
        "poa-dog-screen":
          "url('src/screens/proof-of-attendency/image_dog.svg')",
        "poa-dog-award":
          "url('src/screens/proof-of-attendency-award/dog_image.svg')",
      },
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
