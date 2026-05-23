import { join } from "path"

export default {
  plugins: {
    tailwindcss: {
      config: join(process.cwd(), "apps/nfid-frontend/tailwind.config.js"),
    },
  },
}
