import { JEST_GLOBALS } from "../../config/jest-globals.cjs"
const config = {
  displayName: "nfid-frontend",
  preset: "../../jest.preset.js",
  coverageDirectory: "../../coverage/apps/nfid-frontend",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "mjs"],
  globals: {
    ...JEST_GLOBALS,
  },
  testMatch: ["**/*.spec.(js|ts|tsx)"],
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": [
      "ts-jest",
      { tsconfig: "<rootDir>/tsconfig.spec.json", diagnostics: false },
    ],
    "^.+\\.mjs$": [
      "ts-jest",
      { tsconfig: "<rootDir>/tsconfig.spec.json", diagnostics: false },
    ],
  },
  transformIgnorePatterns: [
    "node_modules/(?!(@icp-sdk|@dfinity|dom-accessibility-api)/)",
  ],
  collectCoverage: false,
  coverageThreshold: {
    global: {
      branches: 99,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  collectCoverageFrom: ["src/**/*.ts", "!**/node_modules/**"],
  setupFilesAfterEnv: ["./src/setupTests.ts"],
  roots: ["src/"],
  moduleDirectories: ["node_modules"],
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
    "^@icp-sdk/canisters/cketh$":
      "<rootDir>/../../node_modules/@icp-sdk/canisters/cketh/index.js",
    "^@icp-sdk/canisters/sns$":
      "<rootDir>/../../node_modules/@icp-sdk/canisters/sns/index.js",
    "^@dfinity/utils$":
      "<rootDir>/../../node_modules/@dfinity/utils/dist/index.js",
    "^dom-accessibility-api/dist/(.*)\\.mjs$":
      "<rootDir>/../../node_modules/dom-accessibility-api/dist/$1.js",
    "\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|did)(\\?.*)?$":
      "<rootDir>/mocks/fileMock.ts",
    "\\.(css|less)$": "<rootDir>/mocks/fileMock.ts",
    "^frontend/(.*)$": "<rootDir>/src/$1",
    "^uuid$": "<rootDir>/../../__mocks__/uuid.ts",
  },
  globalSetup: "./global-setup.js",
}
export default config
