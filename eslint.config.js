import nxPlugin from "@nx/eslint-plugin"
import typescriptEslint from "@typescript-eslint/eslint-plugin"
import typescriptParser from "@typescript-eslint/parser"
import babelParser from "@babel/eslint-parser"
import reactHooks from "eslint-plugin-react-hooks"
import reactPlugin from "eslint-plugin-react"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sharedTypeScriptRules = {
  "no-extra-semi": "error",
  "@typescript-eslint/no-unused-vars": [
    "warn",
    {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      ignoreRestSiblings: true,
    },
  ],
  "@typescript-eslint/no-explicit-any": "warn",
  "react-hooks/rules-of-hooks": "error",
  "react-hooks/exhaustive-deps": "warn",
  "prefer-const": "warn",
  "no-console": ["warn", { allow: ["warn", "error"] }],
}

const typeAwareRules = {
  "@typescript-eslint/prefer-nullish-coalescing": "warn",
  "@typescript-eslint/prefer-optional-chain": "warn",
  "@typescript-eslint/no-floating-promises": "warn",
  "@typescript-eslint/await-thenable": "error",
}

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "tmp/**",
      ".nx/**",
      "coverage/**",
      "**/*.config.js",
      "**/*.config.cjs",
      "**/.storybook/**",
      "**/storybook/**",
      "**/*.d.ts",
      "apps/nfid-frontend/src/integration/_ic_api/**",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    plugins: {
      "@nx": nxPlugin,
    },
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,
          allow: [
            "../../config/**",
            "packages/**",
            "apps/**",
            "@nfid/integration/token/*",
          ],
          banTransitiveDependencies: false,
          checkDynamicDependenciesExceptions: [],
          allowCircularSelfDependency: true,
          depConstraints: [
            {
              sourceTag: "layer:presentation",
              onlyDependOnLibsWithTags: ["layer:domain", "layer:shared"],
            },
            {
              sourceTag: "layer:domain",
              onlyDependOnLibsWithTags: ["layer:shared"],
            },
            {
              sourceTag: "layer:app",
              onlyDependOnLibsWithTags: [
                "layer:presentation",
                "layer:domain",
                "layer:shared",
              ],
            },
            {
              sourceTag: "layer:shared",
              onlyDependOnLibsWithTags: ["layer:shared"],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "packages/ui/**/*.ts",
      "packages/ui/**/*.tsx",
      "apps/nfid-demo/**/*.ts",
      "apps/nfid-demo/**/*.tsx",
    ],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
      react: reactPlugin,
      "react-hooks": reactHooks,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...sharedTypeScriptRules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: [
      "packages/ui/**",
      "**/*.d.ts",
      "apps/nfid-frontend/src/integration/_ic_api/**",
      "apps/nfid-demo/**",
    ],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["./tsconfig.base.json"],
        tsconfigRootDir: __dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
      react: reactPlugin,
      "react-hooks": reactHooks,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...sharedTypeScriptRules,
      ...typeAwareRules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
        babelOptions: {
          presets: ["@babel/preset-env", "@babel/preset-react"],
        },
      },
    },
    rules: {
      "no-extra-semi": "off",
    },
  },
  {
    files: [
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "**/*.spec.js",
      "**/*.spec.jsx",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.test.js",
      "**/*.test.jsx",
    ],
    languageOptions: {
      globals: {
        jest: "readonly",
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        vi: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "no-console": "off",
    },
  },
  {
    files: ["packages/ui/**/*"],
    rules: {
      "@nx/enforce-module-boundaries": "off",
    },
  },
  {
    files: ["apps/nfid-frontend/**/*"],
    rules: {
      "@nx/enforce-module-boundaries": "off",
    },
  },
  {
    files: ["apps/nfid-demo/**/*"],
    rules: {
      "@nx/enforce-module-boundaries": "off",
    },
  },
]
