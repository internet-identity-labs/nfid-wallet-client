import React, { useState } from "react"

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
    // Group iiPersonas by hostname and count the number of iiPersonas
    const personasByHostname = applications.reduce((acc, persona) => {
      const applicationName = applicationsMeta?.find(
        (app) => app.domain === persona.domain,
      )?.name

      const personas = acc[applicationName ?? ""] || []
      acc[applicationName ?? ""] = [...personas, persona]

      return acc
    }, {} as { [applicationName: string]: Account[] })

    // Map the iiPersonas by application to an array of objects
    const personaByHostnameArray = Object.entries(personasByHostname).map(
      ([applicationName, accounts]) => {
        return {
          applicationName,
          // Icon is not there yet
          // applicationIcon: applicationsMeta?.find((app) => app.name === applicationName).icon,
          accountsCount: accounts.length,
          domain: accounts[0].domain,
        }
      },
    )

    return personaByHostnameArray
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
