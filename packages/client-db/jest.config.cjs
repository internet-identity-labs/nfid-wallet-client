const { JEST_GLOBALS } = require("../../config/jest-globals.cjs")

module.exports = {
  displayName: "client-db",
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
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory: "../../coverage/packages/client-db",
  setupFilesAfterEnv: ["./src/setupTests.ts"],
}
