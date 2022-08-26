const dotenv = require("dotenv")

dotenv.config({ path: ".env.local" })

module.exports = {
  globals: {
    "ts-jest": {
      preserveSymlinks: true,
    },
    INTERNET_IDENTITY_CANISTER_ID: "nprnb-waaaa-aaaaj-qax4a-cai",
    IDENTITY_MANAGER_CANISTER_ID: "74gpt-tiaaa-aaaak-aacaa-cai",
    PUB_SUB_CHANNEL_CANISTER_ID: "rdmx6-jaaaa-aaaaa-aaadq-cai",
    VERIFIER_CANISTER_ID: "rdmx6-jaaaa-aaaaa-aaadq-cai",
    LEDGER_CANISTER_ID: "ryjl3-tyaaa-aaaaa-aaaba-cai",
    CYCLES_MINTER_CANISTER_ID: "rkp4c-7iaaa-aaaaa-aaaca-cai",
    VERIFY_PHONE_NUMBER:
      "https://ia15v0pzlb.execute-api.us-east-1.amazonaws.com/dev/verify/",
    SYMMETRIC:
      "https://ia15v0pzlb.execute-api.us-east-1.amazonaws.com/dev/symmetric/",
    IC_HOST: "https://ic0.app",
    II_ENV: "dev",
    IS_DEV: "",
    IS_E2E_TEST: false,
    GOOGLE_CLIENT_ID:
      "339872286671-87oou3adnvl7hst9gd90r9k7j6enl7vk.apps.googleusercontent.com",
    SIGNIN_GOOGLE: "/signin",
    CURRCONV_TOKEN: process.env.CURRCONV_TOKEN,
  },
  testMatch: ["**/*.spec.(js|ts|tsx)"],
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "ts-jest",
  },
  collectCoverage: false,
  coverageDirectory: "./coverage",
  coverageThreshold: {
    global: {
      branches: 99,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  collectCoverageFrom: ["src/**/*.ts", "!**/node_modules/**"],
  setupFilesAfterEnv: ["./test/setup.ts", "./src/setupTests.ts"],
  roots: ["test/", "src/"],
  moduleDirectories: ["node_modules"],
  moduleNameMapper: {
    "\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|did)$":
      "<rootDir>/mocks/fileMock.js",
    "\\.(css|less)$": "<rootDir>/mocks/fileMock.js",
    "^frontend/(.*)$": "<rootDir>/src/$1",
  },
}
