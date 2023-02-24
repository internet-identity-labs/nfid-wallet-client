import { JEST_GLOBALS } from "../../config/jest-globals"

export default {
  displayName: "client-db",
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
  coverageDirectory: "../../coverage/packages/client-db",
  setupFilesAfterEnv: ["./src/setupTests.ts"],
}
