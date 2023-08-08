type app = {
  domain: string
  name: string
}

export function getWalletName(
  applications: app[],
  domain: string,
  accountId: number | string,
) {
  if (!applications) return ""

  if (accountId == "-1") return "My NFID profile"

  return `${
    applications.find((app) => app.domain === domain)?.name ?? "NFID"
  } account ${Number(accountId) + 1}`
}
