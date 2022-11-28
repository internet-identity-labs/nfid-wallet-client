const defaultTheme = require("tailwindcss/defaultTheme")
const { join } = require("path")

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, "{src,public}/**/*!(*.stories|*.spec).{ts,tsx,html}"),
    "../../packages/ui/**/*!(*.stories|*.spec).{ts,tsx,html}",
  ],
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
      screens: {
        ...defaultTheme.screens,
        xs: "375px",
      },
    },
  },
}
