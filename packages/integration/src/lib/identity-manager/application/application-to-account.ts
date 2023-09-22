import { Account } from "../account"
import { Application } from "./types"

export function applicationToAccount(application: Application): Account {
  if (!application.isNftStorage)
    throw new Error(
      "This application is not intended to be used as a token account.",
    )
  return {
    domain: application.domain,
    label: "",
    accountId: "0",
    alias: application.alias,
    icon: application.logo,
  }
}
