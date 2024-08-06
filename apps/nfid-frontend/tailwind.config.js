const { createGlobPatternsForDependencies } = require("@nx/react/tailwind")
const defaultTheme = require("tailwindcss/defaultTheme")
const { join } = require("path")

const dependencies = createGlobPatternsForDependencies(__dirname)
console.log("apps/nfid-frontend/tailwind.config.js", { dependencies })

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, "{src,public}/**/*!(*.stories|*.spec).{ts,tsx,html}"),
    ...dependencies,
  ],
  plugins: [
    require("../../packages/ui-tailwind-core/src/forms"),
    require("../../packages/ui-tailwind-core"),
    require("tailwindcss-radix")(),
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
