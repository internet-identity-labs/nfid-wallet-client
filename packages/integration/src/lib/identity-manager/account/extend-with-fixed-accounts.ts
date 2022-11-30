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
    if (
      !acc.find(
        (a) => a.domain === account.domain && a.accountId === account.accountId,
      )
    ) {
      return [...acc, account]
    }
    return acc
  }, accounts)
}
