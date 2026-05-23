import { JEST_GLOBALS } from "../../config/jest-globals.js"

export default {
  displayName: "integration",
  preset: "../../jest.preset.js",
  globals: { ...JEST_GLOBALS },
  transform: {
    "^.+\\.[tj]s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }],
  },
  moduleNameMapper: {
    "^uuid$": "<rootDir>/../../__mocks__/uuid.ts",
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory: "../../coverage/packages/integration",
  setupFiles: ["./src/setup-tests.ts"],
}
