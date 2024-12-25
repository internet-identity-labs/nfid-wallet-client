import { JEST_GLOBALS } from "../../config/jest-globals"

const config = {
  displayName: "nfid-frontend",
  preset: "../../jest.preset.js",
  coverageDirectory: "../../coverage/apps/nfid-frontend",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  globals: {
    ...JEST_GLOBALS,
  },
  testMatch: ["**/*.spec.(js|ts|tsx)"],
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "ts-jest",
  },
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
    "\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|did)$":
      "<rootDir>/mocks/fileMock.js",
    "\\.(css|less)$": "<rootDir>/mocks/fileMock.js",
    "^frontend/(.*)$": "<rootDir>/src/$1",
  },
  globalSetup: "./global-setup.js",
}
export default config
