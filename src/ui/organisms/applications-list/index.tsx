import React from "react"

import { List } from "frontend/ui/molecules/list"
import { getUrl } from "frontend/ui/utils"

import { ApplicationListItem } from "./list-item"

interface IAccount {
  applicationName: string
  accountsCount: number
  domain: string
  icon?: string
  alias: string[]
}

interface ApplicationListProps {
  accounts: IAccount[]
}

export const ApplicationList: React.FC<ApplicationListProps> = ({
  accounts = [],
}) => {
  const handleNavigateToApplication = React.useCallback(
    (application: IAccount) => {
      const domain =
        application.alias && application.alias.length
          ? application.alias[0]
          : application.domain

      if (domain) window.open(getUrl(domain), "_blank")
    },
    [],
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
                {application.applicationName[0].toUpperCase()}
              </span>
            )
          }
          defaultAction={false}
          onClick={() => handleNavigateToApplication(application)}
          accountsLength={application.accountsCount}
        />
      ))}
    </List.Items>
  )
}
