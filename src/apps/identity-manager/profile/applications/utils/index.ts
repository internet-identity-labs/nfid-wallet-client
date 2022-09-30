import {
  Account,
  Application,
  rmProto,
} from "frontend/integration/identity-manager"
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
    [applicationName: string]: Account[]
  }>((acc, account) => {
    const applicationMeta = applicationsMeta?.find(({ domain }) => {
      return domain.includes(account.domain)
    })

    const applicationName = applicationMeta?.name ?? getUrl(account.domain).host
    const accounts = acc[applicationName] || []

    acc[applicationName] = [
      ...accounts,
      {
        ...account,
        ...applicationMeta,
      },
    ]

    return acc
  }, {})

  const personaByHostnameArray = Object.entries(personasByHostname)
    .map(([applicationName, accounts]) => {
      return {
        applicationName: rmProto(applicationName),
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
