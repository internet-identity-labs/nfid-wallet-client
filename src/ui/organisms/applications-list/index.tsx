import React from "react"

import { List } from "frontend/ui/molecules/list"
import { getUrl } from "frontend/ui/utils"

import { ApplicationListItem } from "./list-item"

interface IAccount {
  applicationName: string
  accountsCount: number
  domain: string
  icon?: string
  alias?: string[]
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

  const getApplicationAlias = (application: IAccount) => {
    const alias = application?.alias?.map((alias) => getUrl(alias).host)
    if (alias && alias.length) return alias.join(",")
    return getUrl(application.domain).host
  }

  return (
    <List.Items className="ml-0">
      {accounts.map((application, index) => (
        <ApplicationListItem
          key={index}
          title={application.applicationName}
          subtitle={getApplicationAlias(application)}
          icon={
            application.icon ? (
              <img src={application.icon} alt="app icon" />
            ) : (
              <span className="text-xl font-medium text-blue-base">
                {application.applicationName[0]}
              </span>
            )
          }
          defaultAction={false}
          onClick={() =>
            handleNavigateToApplication(application.applicationName)
          }
          accountsLength={application.accountsCount}
        />
      ))}
    </List.Items>
  )
}
