import React from "react"

import { Account } from "frontend/integration/identity-manager"
import { List } from "frontend/ui/molecules/list"
import { ListItem } from "frontend/ui/molecules/list/list-item"
import { getUrl } from "frontend/ui/utils"

interface ApplicationListProps {
  accounts: Account[]
}

export const ApplicationList: React.FC<ApplicationListProps> = ({
  accounts = [],
}) => {
  const myApplications = React.useMemo(() => {
    // Group iiPersonas by hostname and count the number of iiPersonas
    const personasByHostname = accounts.reduce((acc, persona) => {
      const hostname = getUrl(persona.domain).hostname.split(".")[0]
      const applicationName =
        hostname.charAt(0).toUpperCase() + hostname.slice(1)
      const personas = acc[applicationName] || []
      acc[applicationName] = [...personas, persona]

      return acc
    }, {} as { [applicationName: string]: Account[] })

    // Map the iiPersonas by application to an array of objects
    const personaByHostnameArray = Object.entries(personasByHostname).map(
      ([applicationName, accounts]) => {
        return {
          applicationName,
          accountsCount: accounts.length,
        }
      },
    )

    return personaByHostnameArray.sort((a, b) =>
      a.applicationName.localeCompare(b.applicationName),
    )
  }, [accounts])

  const handleNavigateToApplication = React.useCallback(
    (applicationName: string) => {
      const application = accounts.find((persona) => {
        return persona.domain.includes(applicationName.toLowerCase())
      })

      if (application) {
        window.open(getUrl(application.domain), "_blank")
      }
    },
    [accounts],
  )

  return (
    <List.Items className="ml-0">
      {myApplications.map((application, index) => (
        <ListItem
          key={index}
          title={application.applicationName}
          subtitle={`${application.accountsCount} persona${
            application.accountsCount > 1 ? "s" : ""
          }`}
          icon={
            <span className="text-xl font-medium text-blue-base">
              {application.applicationName[0]}
            </span>
          }
          defaultAction={false}
          onClick={() =>
            handleNavigateToApplication(application.applicationName)
          }
        />
      ))}
    </List.Items>
  )
}
