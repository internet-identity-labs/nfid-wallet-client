const defaultTheme = require("tailwindcss/defaultTheme")
const { join } = require("path")

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, "src/**/*.{ts,tsx,html}"),
    join(__dirname, "public/**/*.html"),
    join(__dirname, "../../packages/ui/src/**/*.{ts,tsx,html}"),
    join(__dirname, "../../packages/ui-tailwind-core/src/**/*.{ts,tsx,html}"),
    "!" + join(__dirname, "src/**/*.stories.{ts,tsx}"),
    "!" + join(__dirname, "../../packages/ui/src/**/*.stories.{ts,tsx,mdx}"),
  ],
  darkMode: "class",
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
