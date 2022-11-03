import React from "react"

import { ApplicationAccount } from "frontend/apps/identity-manager/profile/applications/utils"
import { ApplicationIcon } from "frontend/ui/atoms/application-icon"
import { List } from "frontend/ui/molecules/list"

import { ApplicationListItem } from "./list-item"

interface ApplicationListProps {
  accounts: ApplicationAccount[]
}

export const ApplicationList: React.FC<ApplicationListProps> = ({
  accounts = [],
}) => (
  <List.Items className="ml-0">
    {accounts.map((application, index) => (
      <ApplicationListItem
        key={index}
        title={application.applicationName}
        subtitle={application.aliasDomains.join(", ")}
        domain={application.aliasDomains[0] || application.derivationOrigin}
        icon={
          <ApplicationIcon
            appName={application.applicationName}
            icon={application.icon}
          />
        }
        defaultAction={false}
        accountsLength={application.accountsCount}
      />
    ))}
  </List.Items>
)
