const { createGlobPatternsForDependencies } = require("@nx/react/tailwind")
const defaultTheme = require("tailwindcss/defaultTheme")
const { join } = require("path")

module.exports = {
  content: [
    join(__dirname, "src/**/*!(*.stories|*.spec).{ts,tsx,html}"),
    ...createGlobPatternsForDependencies(),
  ],
  plugins: [
    require("../../packages/ui-tailwind-core/src/forms"),
    require("../../packages/ui-tailwind-core"),
    require("tailwindcss-radix")(),
    require("tailwind-scrollbar")({ nocompatible: true }),
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
