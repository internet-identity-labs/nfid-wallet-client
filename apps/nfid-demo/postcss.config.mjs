import { join } from "path"

export default {
  plugins: {
    tailwindcss: {
      config: join(import.meta.dirname, "tailwind.config.js"),
    },
  },
}
