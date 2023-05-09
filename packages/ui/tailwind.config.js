const { createGlobPatternsForDependencies } = require("@nrwl/react/tailwind")
const { join } = require("path")

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, "src/**/*!(*.stories|*.spec).{ts,tsx,html}"),
    ...createGlobPatternsForDependencies(),
  ],
  plugins: [
    require("../../packages/ui-tailwind-core/src/forms"),
    require("../../packages/ui-tailwind-core"),
    require("tailwindcss-radix")(),
  ],
}
