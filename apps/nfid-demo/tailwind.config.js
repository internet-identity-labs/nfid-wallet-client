import defaultTheme from "tailwindcss/defaultTheme"
import path from "node:path"
import { fileURLToPath } from "node:url"
import forms from "../../packages/ui-tailwind-core/src/forms/index.js"
import uiTailwindCore from "../../packages/ui-tailwind-core/src/index.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.join(__dirname, "src/**/*.{ts,tsx,html}"),
    path.join(__dirname, "public/**/*.html"),
    path.join(__dirname, "../../packages/ui/src/**/*.{ts,tsx,html}"),
    path.join(
      __dirname,
      "../../packages/ui-tailwind-core/src/**/*.{ts,tsx,html}",
    ),

    "!" + path.join(__dirname, "src/**/*.stories.{ts,tsx}"),
    "!" +
      path.join(__dirname, "../../packages/ui/src/**/*.stories.{ts,tsx,mdx}"),
  ],

  darkMode: "class",

  plugins: [forms, uiTailwindCore],

  theme: {
    extend: {
      fontFamily: {
        ...defaultTheme.fontFamily,
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
    },
  },
}
