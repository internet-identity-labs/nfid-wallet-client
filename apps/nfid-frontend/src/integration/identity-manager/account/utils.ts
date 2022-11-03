import { Account, Application } from ".."

export const isDefaultLabel = (a: string) =>
  /^Account #\d*$/.test(a) || a === undefined || a === ""

export const getWalletName = (account: Account, application?: Application) => {
  const accountLabel = isDefaultLabel(account.label)
    ? `account ${Number(account.accountId) + 1}`
    : account.label

  const applicationName =
    application?.name || account.alias?.[0] || account.domain

  return `${applicationName} ${accountLabel}`
}
