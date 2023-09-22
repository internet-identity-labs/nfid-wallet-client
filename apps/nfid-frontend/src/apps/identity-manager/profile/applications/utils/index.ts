import { Account, Application } from "@nfid/integration"

import { rmProto } from "frontend/integration/identity-manager"
import { getUrl } from "frontend/ui/utils"

export interface ApplicationAccount {
  applicationName: string
  accountsCount: number
  derivationOrigin: string
  aliasDomains: string[]
  icon?: string
}

export const mapApplicationAccounts = (
  accounts: Account[],
  applicationsMeta: Application[],
): ApplicationAccount[] => {
  const personasByHostname = accounts.reduce<{
    [applicationName: string]: Array<
      Account & { applicationName: string; icon?: string }
    >
  }>((acc, account) => {
    const applicationMeta = applicationsMeta?.find(({ domain }) => {
      return rmProto(domain) === rmProto(account.domain)
    })

    const applicationDomain = applicationMeta?.domain
      ? getUrl(applicationMeta.domain).host
      : getUrl(account.domain).host

    const accounts = acc[applicationDomain] || []

    acc[applicationDomain] = [
      ...accounts,
      {
        ...account,
        applicationName: applicationMeta?.name || applicationDomain,
        alias: applicationMeta?.alias,
        icon: applicationMeta?.logo,
      },
    ]

    return acc
  }, {})

  const personaByHostnameArray = Object.entries(personasByHostname)
    .map(([_, accounts]) => {
      return {
        applicationName: accounts[0].applicationName,
        accountsCount: accounts.length,
        derivationOrigin: accounts[0].domain,
        icon: accounts[0].icon,
        aliasDomains: (accounts[0].alias || []).map((a) => getUrl(a).host),
      }
    })
    .sort(
      (
        { applicationName: applicationNameA },
        { applicationName: applicationNameB },
      ) => (applicationNameA < applicationNameB ? 1 : -1),
    )

  return personaByHostnameArray
}
