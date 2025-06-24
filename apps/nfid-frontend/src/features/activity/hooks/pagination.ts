import { useEffect, useState } from "react"

import { useSWR } from "@nfid/swr"

import { PAGINATION_ITEMS } from "../constants"
import { IActivityRowGroup } from "../types"
import { getAllActivity } from "../utils/activity"
import { useBtcAddress } from "frontend/hooks"

// TODO: make the pagination reusable
export const useActivityPagination = (initialFilter: string[] = []) => {
  const [filter, setFilter] = useState<string[]>(initialFilter)
  const [offset, setOffset] = useState(0)
  const [activities, setActivities] = useState<IActivityRowGroup[]>([])
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const [hasMoreData, setHasMoreData] = useState(true)
  const { btcAddress } = useBtcAddress()
  const { data, isValidating, mutate } = useSWR(
    ["activity", filter, offset],
    () =>
      getAllActivity({
        filteredContracts: filter,
        offset,
        limit: PAGINATION_ITEMS,
        btcAddress,
      }),
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  useEffect(() => {
    setActivities([])
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
    setOffset(newOffset)
    setIsButtonLoading(false)
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
