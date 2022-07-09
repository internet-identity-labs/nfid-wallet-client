module.exports = {
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
<<<<<<< HEAD
=======
    INTERNET_IDENTITY_CANISTER_ID: "rdmx6-jaaaa-aaaaa-aaadq-cai",
    IDENTITY_MANAGER_CANISTER_ID: "rdmx6-jaaaa-aaaaa-aaadq-cai",
    PUB_SUB_CHANNEL_CANISTER_ID: "rdmx6-jaaaa-aaaaa-aaadq-cai",
    IM_ADDITION_CANISTER_ID: "rdmx6-jaaaa-aaaaa-aaadq-cai",
    VERIFIER_CANISTER_ID: "rdmx6-jaaaa-aaaaa-aaadq-cai",
    VERIFY_PHONE_NUMBER:
      "https://ia15v0pzlb.execute-api.us-east-1.amazonaws.com/dev/verify/",
    IC_HOST: "https://ic0.app",
    II_ENV: "dev",
    fetch: () => {},
>>>>>>> ecd20300 (feat: pn cred flow)
  },
  testMatch: ["**/*.spec.(js|ts)"],
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
  setupFilesAfterEnv: ["./test/setup.js"],
  roots: ["test/", "src/"],
  moduleDirectories: ["node_modules", "."],
  moduleNameMapper: {
    "^frontend/(.*)$": "<rootDir>/src/$1",
  },
}
