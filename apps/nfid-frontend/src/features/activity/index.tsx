import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import useSWR from "swr"

import { Button, Table } from "@nfid-frontend/ui"
import {
  getICRC1Canisters,
  getICRC1HistoryDataForUserPaginated,
} from "@nfid/integration/token/icrc1"

import { getLambdaCredentials } from "frontend/integration/lambda/util/util"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import ActivityEmpty from "./components/activity-empty"
import { ActivityTableGroup } from "./components/activity-table-group"
import { getAllActivity } from "./connector/activity-factory"
import { PAGINATION_ITEMS } from "./constants"
import { IActivityRowGroup } from "./types"

export interface IActivityPage {}

const ActivityPage = () => {
  const { state } = useLocation()
  const [filter, setFilter] = useState<string[]>(
    state && state.canisterId ? [state.canisterId] : [],
  )
  const [offset, setOffset] = useState(0)
  const [activities, setActivities] = useState<IActivityRowGroup[]>([])
  const [icrcCount, setIcrcCount] = useState(BigInt(20))
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const [hasMoreData, setHasMoreData] = useState(true)

  const { data, isValidating, mutate } = useSWR(
    ["activity", filter, offset],
    () => getAllActivity(filter, offset, PAGINATION_ITEMS),
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  useEffect(() => {
    setActivities([])
    setIcrcCount(BigInt(20))
    setOffset(0)
    mutate()
  }, [filter, mutate])

  useEffect(() => {
    if (!data) return

    if (data.transactions) {
      setActivities((prevActivities) => {
        const mergedActivities = [...prevActivities]
        data.transactions.forEach((newGroup) => {
          const existingGroup = mergedActivities.find(
            (group) => group.date === newGroup.date,
          )
          if (existingGroup) {
            existingGroup.rows = [...existingGroup.rows, ...newGroup.rows]
          } else {
            mergedActivities.push(newGroup)
          }
        })
        return mergedActivities
      })
      setHasMoreData(data.isEnd)
    }
  }, [data])

  const loadMore = async () => {
    setIsButtonLoading(true)
    const newOffset = offset + PAGINATION_ITEMS

    if (shouldLoadMoreICRC1(newOffset)) {
      await loadData()
    } else {
      setOffset(newOffset)
      mutate()
    }

    setIsButtonLoading(false)
  }

  const shouldLoadMoreICRC1 = (newOffset: number) => {
    const currentRowCount = activities.reduce(
      (acc, group) => acc + group.rows.length,
      0,
    )
    return currentRowCount < newOffset
  }

  const loadData = async () => {
    const { rootPrincipalId, publicKey } = await getLambdaCredentials()
    const canisters = await getICRC1Canisters(rootPrincipalId!)
    const indexedCanisters = canisters
      .filter((canister) => canister.index.length > 0)
      .map((l) => {
        return {
          icrc1: l,
          blockNumberToStartFrom: undefined,
        }
      })

    if (!indexedCanisters.length) return

    await getICRC1HistoryDataForUserPaginated(
      indexedCanisters,
      publicKey,
      icrcCount,
    )

    setIcrcCount(icrcCount + BigInt(10))
    mutate()
  }

  return (
    <>
      <ProfileTemplate
        tokenFilter={filter}
        setTokenFilter={setFilter}
        isLoading={isValidating && offset === 0}
        pageTitle="Activity"
        showBackButton
        hasFilter={true}
      >
        <ProfileContainer
          className="!rounded-0 !sm:rounded-xl border-0 sm:border"
          isActivity={true}
        >
          {!Boolean(activities?.length) && !isValidating ? (
            <ActivityEmpty />
          ) : (
            <>
              <div>
                <Table
                  isActivityTable={true}
                  id="activity-table"
                  tableHeader={
                    <tr className="border-b border-black hidden sm:table-row">
                      <th>Action</th>
                      <th>Asset</th>
                      <th>From</th>
                      <th>To</th>
                    </tr>
                  }
                >
                  {activities?.map((group, index) => (
                    <ActivityTableGroup
                      groupIndex={index}
                      date={group.date}
                      rows={group.rows}
                      key={`group_${index}`}
                    />
                  ))}
                </Table>
              </div>
            </>
          )}
        </ProfileContainer>
        <div className="my-[20px]">
          {hasMoreData && (
            <Button
              disabled={isButtonLoading || isValidating}
              className="block mx-auto"
              onClick={loadMore}
              type="ghost"
            >
              {isButtonLoading || isValidating ? "Loading..." : "Load more"}
            </Button>
          )}
        </div>
      </ProfileTemplate>
    </>
  )
}

export default ActivityPage
