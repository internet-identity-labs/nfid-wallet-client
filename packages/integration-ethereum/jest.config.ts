/* eslint-disable */
export default {
  displayName: "integration-ethereum",
  preset: "../../jest.preset.js",
  globals: {},
  transform: {
    "^.+\\.[tj]s$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.spec.json",
      },
    ],
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory: "../../coverage/packages/integration-ethereum",
  setupFilesAfterEnv: ["./src/setupTests.ts"],
}
