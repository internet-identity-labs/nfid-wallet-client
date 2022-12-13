/* eslint-disable */
import { JEST_GLOBALS } from "../../config/jest-globals"

export default {
  displayName: "integration",
  preset: "../../jest.preset.js",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.spec.json",
    },
    ...JEST_GLOBALS,
  },
  transform: {
    "^.+\\.[tj]s$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory: "../../coverage/packages/integration",
  setupFilesAfterEnv: ["./src/setupTests.ts"],
}
