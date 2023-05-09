/* eslint-disable */
export default {
  displayName: "nfid-service-worker-nfid-service-worker",
  preset: "../../jest.preset.js",
  transform: {
    "^.+\\.[tj]s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }],
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory:
    "../../coverage/packages/nfid-service-worker/nfid-service-worker",
}
