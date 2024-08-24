const defaultTheme = require("tailwindcss/defaultTheme")
const { join } = require("path")

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, "{src,public}/**/*!(*.stories|*.spec).{ts,tsx,html}"),
    "../../packages/ui/**/*!(*.stories|*.spec).{ts,tsx,html}",
  ],
  plugins: [
    require("../../packages/ui-tailwind-core/src/forms"),
    require("../../packages/ui-tailwind-core"),
  ],
  theme: {
    extend: {
      fontFamily: {
        ...defaultTheme.fontFamily,
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
    },
  },
}
