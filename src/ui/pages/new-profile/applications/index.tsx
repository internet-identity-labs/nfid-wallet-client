import React from "react"

import { Account } from "frontend/integration/identity-manager"
import { ApplicationList } from "frontend/ui/organisms/applications-list"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import ProfileApplicationsEmpty from "./empty-state"

interface IProfileApplicationsPage
  extends React.HTMLAttributes<HTMLDivElement> {
  applications: Account[]
}

const ProfileApplicationsPage: React.FC<IProfileApplicationsPage> = ({
  applications,
}) => {
  return (
    <ProfileTemplate pageTitle="Applications">
      {!applications.length ? (
        <ProfileApplicationsEmpty />
      ) : (
        <ProfileContainer
          title="Third-party applications"
          subTitle="Applications you’ve created account with"
        >
          <ApplicationList accounts={applications} />
        </ProfileContainer>
      )}
    </ProfileTemplate>
  )
}

export default ProfileApplicationsPage
