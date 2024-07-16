/* eslint-disable */
import { JEST_GLOBALS } from "../../config/jest-globals"

/* eslint-disable */
export default {
  displayName: "integration-ethereum",
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
  coverageDirectory: "../../coverage/packages/integration-ethereum",
  setupFilesAfterEnv: ["./src/setupTests.ts"],
}
