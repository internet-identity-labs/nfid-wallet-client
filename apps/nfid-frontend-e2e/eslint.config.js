import globals from "globals"
import importPlugin from "eslint-plugin-import"
import rootConfig from "../../eslint.config.js"

export default [
  ...rootConfig,
  {
    files: ["src/**/*.ts", "src/**/*.js"],
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.jest,
        global: true,
        _expect: true,
      },
    },
    rules: {
      "import/no-extraneous-dependencies": "off",
      "import/extensions": ["error", "never"],
      "import/no-unresolved": "off",
      "import/no-anonymous-default-export": [
        "error",
        { allowArrowFunction: true },
      ],
    },
  },
]
