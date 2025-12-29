const nxPlugin = require("@nx/eslint-plugin");

module.exports = [
  {
    ignores: ["node_modules"],
    files: ["*.ts", "*.tsx", "*.js", "*.jsx"],
    languageOptions: {
      parser: "@babel/eslint-parser",
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-env", "@babel/preset-react"],
        },
      },
    },

    plugins: { "@nx": nxPlugin },

    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: "*",
              onlyDependOnLibsWithTags: ["*"],
            },
          ],
        },
      ],
    },

    overrides: [
      {
        files: ["*.ts", "*.tsx"],
        extends: ["plugin:@nx/typescript"],
        languageOptions: {
          parser: "@typescript-eslint/parser",
        },
        rules: {
          "@typescript-eslint/no-extra-semi": "error",
          "no-extra-semi": "off",
        },
      },
      {
        files: ["*.js", "*.jsx"],
        extends: ["plugin:@nx/javascript"],
        rules: {
          "@typescript-eslint/no-extra-semi": "error",
          "no-extra-semi": "off",
        },
      },
      {
        files: ["*.spec.ts", "*.spec.tsx", "*.spec.js", "*.spec.jsx"],
        env: {
          jest: true,
        },
      },
    ],
  },
];