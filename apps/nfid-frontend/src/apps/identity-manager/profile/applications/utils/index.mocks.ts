export const mockAccountApplications = [
  {
    domain: "https://wzkxy-vyaaa-aaaaj-qab3q-cai.ic0.app",
    label: "Account #0",
    accountId: "0",
  },
  {
    domain: "http://localhost:3000",
    label: "Account #0",
    accountId: "0",
  },
  {
    domain: "http://my-sweet-application.com",
    label: "Account #0",
    accountId: "0",
  },
  {
    domain: "https://wzkxy-vyaaa-aaaaj-qab3q-cai.ic0.app",
    label: "Account #1",
    accountId: "1",
  },
  {
    domain: "https://wzkxy-vyaaa-aaaaj-qab3q-cai.ic0.app",
    label: "Account #2",
    accountId: "2",
  },
]

const DUPLICATE_APPLICATION_NAME = "My Sweet App"

export const mockApplicationsMeta = [
  {
    accountLimit: 5,
    domain: "http://localhost:3000",
    name: DUPLICATE_APPLICATION_NAME,
    alias: ["http://localhost:3000"],
    isNftStorage: false,
    isIFrameAllowed: false,
    icon: "https://i.picsum.photos/id/348/60/60.jpg?hmac=BwKvjP6fd5Epl3ISp3wHM37Ppk0WHPbwsAdUomHbKDc",
  },
  {
    accountLimit: 5,
    domain: "my-sweet-application.com",
    name: DUPLICATE_APPLICATION_NAME,
    alias: ["http://my-sweet-application.com"],
    isNftStorage: false,
    isIFrameAllowed: false,
    icon: "https://i.picsum.photos/id/348/60/60.jpg?hmac=BwKvjP6fd5Epl3ISp3wHM37Ppk0WHPbwsAdUomHbKDc",
  },
  {
    accountLimit: 5,
    domain: "https://wzkxy-vyaaa-aaaaj-qab3q-cai.ic0.app",
    name: "NFID-Demo",
    alias: [
      "https://nfid-demo.com",
      "https://wzkxy-vyaaa-aaaaj-qab3q-cai.raw.ic0.app",
      "https://xyzxy-vyaaa-aaaaj-qab3q-cai.raw.ic0.app",
    ],
    isNftStorage: false,
    isIFrameAllowed: false,
  },
  {
    accountLimit: 1,
    domain: "https://zqrbj-lqaaa-aaaal-aa7ja-cai.ic0.app",
    name: "NFID-SA-DEMO",
    alias: [],
    isNftStorage: false,
    isIFrameAllowed: false,
  },
]

export const applicationAccountDetailsNormalized = [
  {
    applicationName: "NFID-Demo",
    accountsCount: 3,
    derivationOrigin: "https://wzkxy-vyaaa-aaaaj-qab3q-cai.ic0.app",
    aliasDomains: [
      "nfid-demo.com",
      "wzkxy-vyaaa-aaaaj-qab3q-cai.raw.ic0.app",
      "xyzxy-vyaaa-aaaaj-qab3q-cai.raw.ic0.app",
    ],
    logo: undefined,
  },
  {
    applicationName: DUPLICATE_APPLICATION_NAME,
    accountsCount: 1,
    derivationOrigin: "http://my-sweet-application.com",
    aliasDomains: ["my-sweet-application.com"],
    logo: "https://i.picsum.photos/id/348/60/60.jpg?hmac=BwKvjP6fd5Epl3ISp3wHM37Ppk0WHPbwsAdUomHbKDc",
  },
  {
    applicationName: DUPLICATE_APPLICATION_NAME,
    accountsCount: 1,
    derivationOrigin: "http://localhost:3000",
    aliasDomains: ["localhost:3000"],
    logo: "https://i.picsum.photos/id/348/60/60.jpg?hmac=BwKvjP6fd5Epl3ISp3wHM37Ppk0WHPbwsAdUomHbKDc",
  },
]
