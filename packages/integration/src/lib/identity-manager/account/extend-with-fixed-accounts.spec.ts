import { Application } from "../application"
import { extendWithFixedAccounts } from "./extend-with-fixed-accounts"
import { Account } from "./types"

describe("extendWithFixedAccounts", () => {
  it("should extend user accounts with static accounts from applications meta", () => {
    const accounts: Account[] = [
      { domain: "example.com", label: "", accountId: "0" },
      { domain: "static-one.com", label: "", accountId: "0" },
    ]
    const applications: Application[] = [
      {
        domain: "static-one.com",
        name: "StaticOne",
        isNftStorage: true,
        accountLimit: 1,
        alias: [],
      },
      {
        domain: "static-two.com",
        name: "StaticTwo",
        isNftStorage: true,
        accountLimit: 1,
        alias: [],
      },
    ]
    expect(extendWithFixedAccounts(accounts, applications)).toEqual([
      { domain: "example.com", label: "", accountId: "0" },
      { domain: "static-one.com", label: "", accountId: "0" },
      {
        domain: "static-two.com",
        label: "",
        accountId: "0",
        icon: undefined,
        alias: [],
      },
    ])
  })
})
