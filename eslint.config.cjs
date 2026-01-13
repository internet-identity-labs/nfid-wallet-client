const nxPlugin = require("@nx/eslint-plugin");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const typescriptParser = require("@typescript-eslint/parser");
const babelParser = require("@babel/eslint-parser");
const reactHooks = require("eslint-plugin-react-hooks");
const reactPlugin = require("eslint-plugin-react");
const importPlugin = require("eslint-plugin-import");
const unusedImportsPlugin = require("eslint-plugin-unused-imports");

const sharedTypeScriptRules = {
  "no-extra-semi": "error",
  // Keep @typescript-eslint/no-unused-vars for variables and imports
  // unused-imports plugin will provide better error messages and auto-fix for imports
  "@typescript-eslint/no-unused-vars": [
    "error",
    {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      ignoreRestSiblings: true,
      caughtErrorsIgnorePattern: "^_",
    },
  ],
  // Use unused-imports plugin for better unused import detection and auto-fix
  // This provides clearer error messages and can auto-remove unused imports
  "unused-imports/no-unused-imports": "error",
  "@typescript-eslint/no-explicit-any": "warn",
  "react-hooks/rules-of-hooks": "error",
  "react-hooks/exhaustive-deps": "warn",
  "prefer-const": "error",
  "no-console": ["warn", { allow: ["warn", "error"] }],
  "import/no-unused-modules": "off",
  "no-unused-vars": "off",
};

const typeAwareRules = {
  "@typescript-eslint/prefer-nullish-coalescing": "warn",
  "@typescript-eslint/prefer-optional-chain": "warn",
  "@typescript-eslint/no-floating-promises": "warn",
  "@typescript-eslint/await-thenable": "error",
};

module.exports = [
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
    files: ["packages/ui/**/*.ts", "packages/ui/**/*.tsx", "apps/nfid-demo/**/*.ts", "apps/nfid-demo/**/*.tsx"],
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
      "react": reactPlugin,
      "react-hooks": reactHooks,
      "unused-imports": unusedImportsPlugin,
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
    ignores: ["packages/ui/**", "**/*.d.ts", "apps/nfid-frontend/src/integration/_ic_api/**", "apps/nfid-demo/**"],
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
      "react": reactPlugin,
      "react-hooks": reactHooks,
      "import": importPlugin,
      "unused-imports": unusedImportsPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.base.json",
        },
      },
    },
    rules: {
      ...sharedTypeScriptRules,
      ...typeAwareRules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          pathGroups: [
            {
              pattern: "@dfinity/**",
              group: "external",
              position: "before",
            },
            {
              pattern: "@nfid/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "frontend/**",
              group: "internal",
            },
            {
              pattern: "src/**",
              group: "internal",
            },
          ],
          pathGroupsExcludedImportTypes: ["react"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/prefer-as-const": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "warn",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/no-empty-interface": "warn",
      "@typescript-eslint/explicit-function-return-type": "off", // Too strict for React
      "no-debugger": "error",
      "no-alert": "warn",
      "no-var": "error",
      "object-shorthand": "warn",
      "prefer-arrow-callback": "warn",
      "prefer-template": "warn",
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
];