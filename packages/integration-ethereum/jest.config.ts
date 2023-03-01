/* eslint-disable */
export default {
  displayName: "integration-ethereum",
  preset: "../../jest.preset.js",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.spec.json",
    },
  },
  transform: {
    "^.+\\.[tj]s$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory: "../../coverage/packages/integration-ethereum",
  setupFilesAfterEnv: ["./src/setupTests.ts"],
}
