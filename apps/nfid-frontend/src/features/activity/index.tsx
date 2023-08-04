import clsx from "clsx"
import useSWR from "swr"

import { Table } from "@nfid-frontend/ui"

import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import { ActivityTableGroup } from "./components/activity-table-group"
import { getAllActivity } from "./connector/activity-factory"

export interface IActivityPage {}

const ActivityPage = () => {
  const { data } = useSWR("activity", getAllActivity)

  return (
    <ProfileTemplate pageTitle="Activity" showBackButton>
      <ProfileContainer>
        <ProfileContainer className={clsx(`bg-gray-200`)}>
          <div className="flex items-center justify-between w-full space-x-10 ">
            123
          </div>
        </ProfileContainer>
        <Table
          tableHeader={
            <tr className="border-b border-black">
              <th>Action</th>
              <th>Asset</th>
              <th className="hidden sm:table-cell">From</th>
              <th className="hidden sm:table-cell">To</th>
            </tr>
          }
        >
          {data?.map((group, index) => (
            <ActivityTableGroup
              groupIndex={index}
              date={group.date}
              rows={group.rows}
              key={`group_${index}`}
            />
          ))}
        </Table>
      </ProfileContainer>
    </ProfileTemplate>
  )
}

export default ActivityPage
