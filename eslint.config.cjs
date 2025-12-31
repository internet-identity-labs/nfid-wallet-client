const nxPlugin = require("@nx/eslint-plugin");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const typescriptParser = require("@typescript-eslint/parser");
const babelParser = require("@babel/eslint-parser");
const reactHooks = require("eslint-plugin-react-hooks");

module.exports = [
  // Ignore patterns
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
  // Base configuration for all files
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
  // TypeScript files configuration for UI package and nfid-demo (without project to avoid tsconfig issues)
  // This must come BEFORE the project-based config to take precedence
  {
    files: ["packages/ui/**/*.ts", "packages/ui/**/*.tsx", "apps/nfid-demo/**/*.ts", "apps/nfid-demo/**/*.tsx"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
      "react-hooks": reactHooks,
    },
    rules: {
      "no-extra-semi": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  // TypeScript files configuration (with project)
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["packages/ui/**", "**/*.d.ts", "apps/nfid-frontend/src/integration/_ic_api/**", "apps/nfid-demo/**"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["./tsconfig.base.json"],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
      "react-hooks": reactHooks,
    },
    rules: {
      "no-extra-semi": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  // JavaScript files configuration
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
  // Test files configuration
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
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // Disable module boundaries rule for UI package (has many .tsx files that NX plugin can't handle)
  {
    files: ["packages/ui/**/*"],
    rules: {
      "@nx/enforce-module-boundaries": "off",
    },
  },
  // Disable module boundaries rule for nfid-frontend app (uses wildcard path mappings that NX plugin can't resolve)
  {
    files: ["apps/nfid-frontend/**/*"],
    rules: {
      "@nx/enforce-module-boundaries": "off",
    },
  },
  // Disable module boundaries rule for nfid-demo app (demo app that imports from nfid-frontend)
  {
    files: ["apps/nfid-demo/**/*"],
    rules: {
      "@nx/enforce-module-boundaries": "off",
    },
  },
];