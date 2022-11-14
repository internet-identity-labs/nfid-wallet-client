/* eslint-disable */
export default {
  displayName: "integration",
  preset: "../../jest.preset.js",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.spec.json",
    },
    INTERNET_IDENTITY_CANISTER_ID: "nprnb-waaaa-aaaaj-qax4a-cai",
    IDENTITY_MANAGER_CANISTER_ID: "74gpt-tiaaa-aaaak-aacaa-cai",
    PUB_SUB_CHANNEL_CANISTER_ID: "rdmx6-jaaaa-aaaaa-aaadq-cai",
    VERIFIER_CANISTER_ID: "rdmx6-jaaaa-aaaaa-aaadq-cai",
    LEDGER_CANISTER_ID: "ryjl3-tyaaa-aaaaa-aaaba-cai",
    CYCLES_MINTER_CANISTER_ID: "rkp4c-7iaaa-aaaaa-aaaca-cai",
    VERIFY_PHONE_NUMBER:
      "https://ia15v0pzlb.execute-api.us-east-1.amazonaws.com/dev/verify/",
    AWS_SYMMETRIC:
      "https://ia15v0pzlb.execute-api.us-east-1.amazonaws.com/dev/symmetric/",
    IC_HOST: "https://ic0.app",
    II_ENV: "dev",
    IS_DEV: "",
    IS_E2E_TEST: false,
    GOOGLE_CLIENT_ID:
      "339872286671-87oou3adnvl7hst9gd90r9k7j6enl7vk.apps.googleusercontent.com",
    SIGNIN_GOOGLE: "/signin",
    CURRCONV_TOKEN: process.env["CURRCONV_TOKEN"],
  },
  transform: {
    "^.+\\.[tj]s$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory: "../../coverage/packages/integration",
  setupFilesAfterEnv: ["./src/setupTests.ts"],
}
