import React, { useState } from "react"

import { groupPersonasByApplications } from "frontend/apps/identity-manager/profile/utils"
import { Account } from "frontend/integration/identity-manager"
import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"
import Pagination from "frontend/ui/molecules/pagination"
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
  const [filteredData, setFilteredData] = useState<any[]>([])
  const { data: applicationsMeta } = useApplicationsMeta()

  const myApplications = React.useMemo(() => {
    if (!applicationsMeta) return []
    return groupPersonasByApplications(applications, applicationsMeta)
  }, [applications, applicationsMeta])

  return (
    <ProfileTemplate pageTitle="Applications">
      {!myApplications.length ? (
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
              data={myApplications}
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
