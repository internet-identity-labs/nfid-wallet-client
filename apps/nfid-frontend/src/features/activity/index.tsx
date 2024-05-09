import useSWR from "swr"

import { Table } from "@nfid-frontend/ui"

import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import { ActivityTableGroup } from "./components/activity-table-group"
import { getAllActivity } from "./connector/activity-factory"
import { useLocation } from "react-router-dom"
import { useEffect } from "react"
import { getICRC1HistoryDataForUser } from "packages/integration/src/lib/token/icrc1"
import { getLambdaCredentials } from "frontend/integration/lambda/util/util"

export interface IActivityPage {}

const ActivityPage = () => {
  const location = useLocation();

  const { isLoading, data } = useSWR("activity", getAllActivity, {
    revalidateOnMount: true,
    revalidateOnFocus: true,
  })

  const getICRCTokenHistory = async () => {
    const { rootPrincipalId, publicKey } = await getLambdaCredentials();
    const historyData = await getICRC1HistoryDataForUser(rootPrincipalId!, publicKey, BigInt(10), undefined);
    console.log('historyData', historyData);
  }

  useEffect(() => {
    getICRCTokenHistory();
  }, []);


  console.log('location!!', location)
  console.log('state!!', data)

  return (
    <ProfileTemplate isLoading={isLoading} pageTitle="Activity" showBackButton>
      <ProfileContainer>
        <Table
          id="activity-table"
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
