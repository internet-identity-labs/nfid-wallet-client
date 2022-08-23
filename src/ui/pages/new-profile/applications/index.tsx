import React, { useState } from "react"

import { Account } from "frontend/integration/identity-manager"
import Pagination from "frontend/ui/molecules/pagination"
import { ApplicationList } from "frontend/ui/organisms/applications-list"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

interface IProfileApplicationsPage
  extends React.HTMLAttributes<HTMLDivElement> {
  applications: Account[]
}

const ProfileApplicationsPage: React.FC<IProfileApplicationsPage> = ({
  applications,
}) => {
  const [filteredData, setFilteredData] = useState<any[]>([])

  return (
    <ProfileTemplate pageTitle="Applications">
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
    </ProfileTemplate>
  )
}

export default ProfileApplicationsPage
