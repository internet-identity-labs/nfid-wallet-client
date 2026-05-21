const { JEST_GLOBALS } = require("../../config/jest-globals.cjs")

module.exports = {
  displayName: "integration",
  preset: "../../jest.preset.js",
  globals: { ...JEST_GLOBALS },
  transform: {
    "^.+\\.[tj]s$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.spec.json",
      },
    ],
  },
  moduleNameMapper: {
    "^uuid$": "<rootDir>/../../__mocks__/uuid.cjs",
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory: "../../coverage/packages/integration",
  setupFiles: ["./src/setup-tests.ts"],
}
