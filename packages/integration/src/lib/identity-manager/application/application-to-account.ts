import { Account } from "../account"

import { Application } from "./types"

export function applicationToAccount(application: Application): Account {
  return {
    domain: application.domain,
    label: "",
    accountId: "0",
    alias: [],
    icon: application.logo,
  }
}
