import { createGlobPatternsForDependencies } from "@nx/react/tailwind.js"
import defaultTheme from "tailwindcss/defaultTheme"
import path from "node:path"

import forms from "../../packages/ui-tailwind-core/src/forms/index.js"
import uiTailwindCore from "../../packages/ui-tailwind-core/src/index.js"
import tailwindRadix from "tailwindcss-radix"
import tailwindScrollbar from "tailwind-scrollbar"
import { fileURLToPath } from "node:url"
import { dirname } from "node:path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const { join } = path

export default {
  content: [
    join(__dirname, "src/**/*!(*.stories|*.spec).{ts,tsx,html}"),
    ...createGlobPatternsForDependencies(__dirname),
  ],

  plugins: [
    forms,
    uiTailwindCore,
    tailwindRadix(),
    tailwindScrollbar({ nocompatible: true }),
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
