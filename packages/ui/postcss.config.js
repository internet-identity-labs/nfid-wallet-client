const { join } = require("path")
const isProduction =
  process.env.NODE_ENV === "production" ||
  process.env.FRONTEND_MODE === "production"

module.exports = {
  plugins: {
    tailwindcss: {
      config: join(__dirname, "tailwind.config.js"),
    },
    ...(isProduction ? { autoprefixer: {} } : {}),
  },
}
