import React from "react"

import { List } from "frontend/ui/molecules/list"
import { getUrl } from "frontend/ui/utils"

import { ApplicationListItem } from "./list-item"

interface IAccount {
  applicationName: string
  accountsCount: number
  domain: string
}
interface ApplicationListProps {
  accounts: IAccount[]
}

export const ApplicationList: React.FC<ApplicationListProps> = ({
  accounts = [],
}) => {
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
      {accounts.map((application, index) => (
        <ApplicationListItem
          key={index}
          title={application.applicationName}
          subtitle={getUrl(application.domain).host}
          icon={
            <span className="text-xl font-medium text-blue-base">
              {application.applicationName[0]}
            </span>
          }
          defaultAction={false}
          onClick={() =>
            handleNavigateToApplication(application.applicationName)
          }
          accountsLength={accounts.length}
        />
      ))}
    </List.Items>
  )
}
