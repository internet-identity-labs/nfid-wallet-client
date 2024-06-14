import { useEffect, useState } from "react"
import useSWR from "swr"

import {
  getICRC1Canisters,
  getICRC1HistoryDataForUserPaginated,
} from "@nfid/integration/token/icrc1"

import { getLambdaCredentials } from "frontend/integration/lambda/util/util"

import { getAllActivity } from "./connector/activity-factory"
import { PAGINATION_ITEMS } from "./constants"
import { IActivityRowGroup } from "./types"

// TODO: make the pagination reusable
export const useActivityPagination = (initialFilter: string[] = []) => {
  const [filter, setFilter] = useState<string[]>(initialFilter)
  const [offset, setOffset] = useState(0)
  const [activities, setActivities] = useState<IActivityRowGroup[]>([])
  const [icrcCount, setIcrcCount] = useState(BigInt(20))
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const [hasMoreData, setHasMoreData] = useState(true)

  const { data, isValidating, mutate } = useSWR(
    ["activity", filter, offset],
    () =>
      getAllActivity({
        filteredContracts: filter,
        offset,
        limit: PAGINATION_ITEMS,
      }),
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

  const resetHandler = () => {
    setFilter([])
  }

  return {
    activities,
    filter,
    setFilter,
    isValidating,
    hasMoreData,
    loadMore,
    isButtonLoading,
    resetHandler,
  }
}
