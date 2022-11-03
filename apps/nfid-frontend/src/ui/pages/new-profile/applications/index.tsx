import React, { useState } from "react"

import { ApplicationAccount } from "frontend/apps/identity-manager/profile/applications/utils"
import Pagination from "frontend/ui/molecules/pagination"
import { ApplicationList } from "frontend/ui/organisms/applications-list"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import ProfileApplicationsEmpty from "./empty-state"

interface IProfileApplicationsPage
  extends React.HTMLAttributes<HTMLDivElement> {
  applications: ApplicationAccount[]
}

const ProfileApplicationsPage: React.FC<IProfileApplicationsPage> = ({
  applications,
}) => {
  const [filteredData, setFilteredData] = useState<ApplicationAccount[]>([])

  return (
    <ProfileTemplate pageTitle="Applications">
      {!applications.length ? (
        <ProfileApplicationsEmpty />
      ) : (
        <>
          <ProfileContainer
            title="Third-party applications"
            subTitle="Applications you’ve created account with"
          >
            <ApplicationList accounts={filteredData} />
          </ProfileContainer>
          <div className="flex justify-end w-full mt-4">
            <Pagination
              data={applications}
              sliceData={setFilteredData}
              perPage={20}
            />
          </div>
        </>
      )}
    </ProfileTemplate>
  )
}

export default ProfileApplicationsPage
