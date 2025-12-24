const config = {
    "root": true,
    "ignorePatterns": ["**/*"],
    "plugins": ["@nx"],
    "overrides": [
      {
        "files": ["*.ts", "*.tsx", "*.js", "*.jsx"],
        "parser": "@babel/eslint-parser",
        "parserOptions": {
          "requireConfigFile": false,
          "babelOptions": {
            "presets": ["@babel/preset-env", "@babel/preset-react"]
          }
        },
        "rules": {
          "@nx/enforce-module-boundaries": [
            "error",
            {
              "enforceBuildableLibDependency": true,
              "allow": [],
              "depConstraints": [
                {
                  "sourceTag": "*",
                  "onlyDependOnLibsWithTags": ["*"]
                }
              ]
            }
          ]
        }
      },
      {
        "files": ["*.ts", "*.tsx"],
        "extends": ["plugin:@nx/typescript"],
        "rules": {
          "@typescript-eslint/no-extra-semi": "error",
          "no-extra-semi": "off"
        }
      },
      {
        "files": ["*.js", "*.jsx"],
        "extends": ["plugin:@nx/javascript"],
        "rules": {
          "@typescript-eslint/no-extra-semi": "error",
          "no-extra-semi": "off"
        }
      },
      {
        "files": ["*.spec.ts", "*.spec.tsx", "*.spec.js", "*.spec.jsx"],
        "env": {
          "jest": true
        },
        "rules": {}
      }
    ]
};

module.exports = config;