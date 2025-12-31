import { JEST_GLOBALS } from "../../config/jest-globals"

export default {
  displayName: "nfid-demo",
  preset: "../../jest.preset.js",
  transform: {
    "^(?!.*\\.(js|jsx|ts|tsx|css|json)$)": "@nx/react/plugins/jest",
    "^.+\\.[tj]sx?$": ["babel-jest", { presets: ["@nx/react/babel"] }],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  coverageDirectory: "../../coverage/apps/nfid-demo",
  setupFilesAfterEnv: ["./src/setupTests.ts"],
  globals: {
    ...JEST_GLOBALS,
  },
}
