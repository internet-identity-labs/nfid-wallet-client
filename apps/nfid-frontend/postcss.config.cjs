const { join } = require("path")

module.exports = {
  plugins: [
    require("tailwindcss")({
      config: join(process.cwd(), "apps/nfid-frontend/tailwind.config.js"),
    }),
  ],
}
