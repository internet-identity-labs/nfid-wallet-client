import { JEST_GLOBALS } from "../../config/jest-globals.js"

export default {
  displayName: "integration",
  preset: "../../jest.preset.js",
  globals: { ...JEST_GLOBALS },
  transform: {
    "^.+\\.[tj]s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }],
    "^.+\\.mjs$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }],
  },
  moduleNameMapper: {
    "^@icp-sdk/auth/client$":
      "<rootDir>/../../__mocks__/@icp-sdk/auth/client.cjs",
    "^@icp-sdk/canisters/ledger/icp$":
      "<rootDir>/../../node_modules/@icp-sdk/canisters/ledger/icp/index.js",
    "^@icp-sdk/canisters/ledger/icrc$":
      "<rootDir>/../../node_modules/@icp-sdk/canisters/ledger/icrc/index.js",
    "^@icp-sdk/canisters/ckbtc$":
      "<rootDir>/../../node_modules/@icp-sdk/canisters/ckbtc/index.js",
    "^@icp-sdk/canisters/nns$":
      "<rootDir>/../../node_modules/@icp-sdk/canisters/nns/index.js",
    "^@icp-sdk/canisters/sns$":
      "<rootDir>/../../node_modules/@icp-sdk/canisters/sns/index.js",
    "^@dfinity/utils$":
      "<rootDir>/../../node_modules/@dfinity/utils/dist/index.js",
    "^uuid$": "<rootDir>/../../__mocks__/uuid.ts",
  },
  transformIgnorePatterns: ["node_modules/(?!(@icp-sdk|@dfinity)/)"],
  moduleFileExtensions: ["mjs", "ts", "js", "html"],
  coverageDirectory: "../../coverage/packages/integration",
  setupFiles: ["./src/setup-tests.ts"],
}
