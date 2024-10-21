import { getUserPrincipalId } from "packages/ui/src/organisms/tokens/utils"
import { useEffect, useState } from "react"
import useSWR from "swr"

import { getICRC1HistoryDataForUser } from "@nfid/integration/token/icrc1"

import { PAGINATION_ITEMS } from "../constants"
import { IActivityRowGroup } from "../types"
import { getAllActivity } from "../utils/activity"

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
  }, [filter])

  useEffect(() => {
    if (!data?.transactions) return

    setActivities((prevActivities) => {
      const mergedActivities = [...prevActivities]

      data.transactions.forEach((newGroup) => {
        const existingGroup = mergedActivities.find(
          (group) => group.date === newGroup.date,
        )
        if (existingGroup) {
          const existingRows = new Set(existingGroup.rows.map((row) => row.id))
          newGroup.rows.forEach((row) => {
            if (!existingRows.has(row.id)) {
              existingGroup.rows.push(row)
            }
          })
        } else {
          mergedActivities.push(newGroup)
        }
      })

      return mergedActivities
    })

    setHasMoreData(data.isEnd)
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
    const { userPrincipal, publicKey } = await getUserPrincipalId()
    await getICRC1HistoryDataForUser(userPrincipal, publicKey, icrcCount)

    setIcrcCount(icrcCount + BigInt(PAGINATION_ITEMS))
    mutate()
  }

  const resetHandler = () => {
    setFilter([])
    setActivities([])
    setOffset(0)
    setHasMoreData(true)
    mutate()
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