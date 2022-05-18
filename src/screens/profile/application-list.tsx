import clsx from "clsx"
import React from "react"

import { H5 } from "frontend/design-system/atoms/typography"
import { List } from "frontend/design-system/molecules/list"
import { ListItem } from "frontend/design-system/molecules/list/list-item"
import { ListItemPlaceholder } from "frontend/design-system/molecules/placeholders/list-item"
import { NFIDPersona } from "frontend/services/identity-manager/persona/types"
import { getUrl } from "frontend/utils"

interface ApplicationListProps {
  personas: NFIDPersona[]
}

export const ApplicationList: React.FC<ApplicationListProps> = ({
  personas = [],
}) => {
  const myApplications = React.useMemo(() => {
    // Group iiPersonas by hostname and count the number of iiPersonas
    const personasByHostname = personas.reduce((acc, persona) => {
      const hostname = getUrl(persona.domain).hostname.split(".")[0]
      const applicationName =
        hostname.charAt(0).toUpperCase() + hostname.slice(1)
      const personas = acc[applicationName] || []
      acc[applicationName] = [...personas, persona]

      return acc
    }, {} as { [applicationName: string]: NFIDPersona[] })

    // Map the iiPersonas by application to an array of objects
    const personaByHostnameArray = Object.entries(personasByHostname).map(
      ([applicationName, iiPersonas]) => {
        return {
          applicationName,
          iiPersonas,
          iiPersonasCount: iiPersonas.length,
        }
      },
    )

    return personaByHostnameArray
  }, [personas])

  const handleNavigateToApplication = React.useCallback(
    (applicationName: string) => {
      const application = personas.find((persona) => {
        return persona.domain.includes(applicationName.toLowerCase())
      })

      if (application) {
        window.open(getUrl(application.domain), "_blank")
      }
    },
    [personas],
  )

  return (
    <div className={clsx("px-5 md:px-16 pt-5", "bg-white overflow-hidden")}>
      <List>
        <List.Header>
          <div className="mb-3">
            <H5>Applications</H5>
          </div>
        </List.Header>
        <List.Items className="ml-0">
          {myApplications.length > 0 ? (
            myApplications.map((application, index) => (
              <ListItem
                key={index}
                title={application.applicationName}
                subtitle={`${application.iiPersonasCount} persona${
                  application.iiPersonasCount > 1 ? "s" : ""
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
            ))
          ) : (
            <div>
              <div>
                Applications you’ve created accounts with will be listed here.
              </div>

              <div>
                <div className="relative">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <ListItemPlaceholder key={index} index={index} />
                  ))}

                  <div className="absolute left-0 w-full h-full top-8 bg-gradient-to-t from-white to-white/5" />
                </div>
              </div>
            </div>
          )}
        </List.Items>
      </List>
    </div>
  )
}
