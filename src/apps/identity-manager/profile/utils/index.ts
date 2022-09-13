import { Account, Application } from "frontend/integration/identity-manager"
import { getUrl } from "frontend/ui/utils"

export const groupPersonasByApplications = (
  applications: Account[],
  applicationsMeta: Application[],
) => {
  const personasByHostname = applications.reduce((acc, persona) => {
    const applicationMeta = applicationsMeta?.find((app) => {
      return app?.alias?.includes(persona.domain)
    })

    const objectKey = applicationMeta?.name ?? getUrl(persona.domain).host
    const personas = acc[objectKey] || []

    acc[objectKey] = [
      ...personas,
      {
        ...persona,
        ...applicationMeta,
      },
    ]

    return acc
  }, {} as { [applicationName: string]: Account[] })

  // Map the iiPersonas by application to an array of objects
  const personaByHostnameArray = Object.entries(personasByHostname).map(
    ([applicationName, accounts]) => {
      return {
        applicationName,
        accountsCount: accounts.length,
        domain: accounts[0].domain,
        icon: accounts[0].icon,
        alias: accounts[0].alias,
      }
    },
  )

  return personaByHostnameArray
}
