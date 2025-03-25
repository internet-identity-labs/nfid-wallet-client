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
    require("tailwind-scrollbar")({ nocompatible: true }),
  ],
  theme: {
    extend: {
      fontFamily: {
        ...defaultTheme.fontFamily,
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      screens: {
        ...defaultTheme.screens,
        xs: "375px",
      },
      lineHeight: {
        120: "120%",
      },
      keyframes: {
        animateCircle: {
          "0%": { transform: "rotate(135deg)" },
          "100%": { transform: "rotate(495deg)" },
        },
        animate: {
          "0%": { transform: "rotate(45deg)" },
          "100%": { transform: "rotate(405deg)" },
        },
      },
    },
  },
}
