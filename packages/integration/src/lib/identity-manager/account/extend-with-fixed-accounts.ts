import { Account } from "."
import { Application } from "../application"
import { applicationToAccount } from "../application/application-to-account"

export const extendWithFixedAccounts = (
  accounts: Account[] = [],
  applications: Application[] = [],
) => {
  const fixedAccounts = applications
    .filter((app) => app.isNftStorage)
    .map(applicationToAccount)

  return fixedAccounts.reduce((acc, account) => {
    const accountAlreadyAdded = acc.find(
      (a) => a.domain === account.domain && a.accountId === account.accountId,
    )
    if (accountAlreadyAdded) {
      return acc
    }
    return [...acc, account]
  }, accounts)
}
