const defaultTheme = require("tailwindcss/defaultTheme")
const { join } = require("path")
const ANIMATION_DURATION = 1
const HIDE_ANIMATION_DURATION = 0.3

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // App runtime sources
    join(__dirname, "src/**/*.{ts,tsx,html}"),
    join(__dirname, "public/**/*.html"),

    // Runtime UI packages used by the app
    join(__dirname, "../../packages/ui/src/**/*.{ts,tsx,html}"),
    join(__dirname, "../../packages/ui-tailwind-core/src/**/*.{ts,tsx,html}"),

    // Exclude non-runtime/test-only files to reduce scan churn
    "!" + join(__dirname, "src/**/*.spec.{ts,tsx}"),
    "!" + join(__dirname, "src/**/*.test.{ts,tsx}"),
    "!" + join(__dirname, "src/**/*.stories.{ts,tsx,mdx}"),
    "!" + join(__dirname, "../../apps/nfid-frontend-e2e/**"),
    "!" + join(__dirname, "../../**/.storybook/**"),
  ],
  darkMode: "class",
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
        hideCircle: {
          "0%": { transform: "scale(1)", opacity: 1 },
          "100%": { transform: "scale(0)", opacity: 0 },
        },
        showCircle: {
          "0%": { transform: "scale(0)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
      },
      animation: {
        animateCircle: `${ANIMATION_DURATION}s linear infinite animateCircle`,
        animate: `${ANIMATION_DURATION}s linear infinite animate`,
        hideCircle: `${HIDE_ANIMATION_DURATION}s cubic-bezier(0.16, 1, 0.3, 1) forwards hideCircle`,
        showCircle: `${HIDE_ANIMATION_DURATION}s cubic-bezier(0.16, 1, 0.3, 1) forwards showCircle`,
      },
    },
  },
}
