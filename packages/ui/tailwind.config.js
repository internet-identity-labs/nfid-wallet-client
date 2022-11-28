const defaultTheme = require("tailwindcss/defaultTheme")
const { join } = require("path")

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [join(__dirname, "src/**/*!(*.stories|*.spec).{ts,tsx,html}")],
  plugins: [
    require("@tailwindcss/forms"),
    require("../../packages/ui-tailwind-core"),
  ],
  theme: {
    extend: {
      fontFamily: {
        ...defaultTheme.fontFamily,
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        mono: ["IBM Plex Mono", ...defaultTheme.fontFamily.mono],
      },
    },
  },
}
