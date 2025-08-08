import { useEffect, useState } from "react"

import { useSWR } from "@nfid/swr"

import { useEthAddress } from "frontend/contexts/eth-address"
import { useBtcAddress } from "frontend/hooks"

import { PAGINATION_ITEMS } from "../constants"
import { IActivityRowGroup } from "../types"
import { getAllActivity } from "../utils/activity"

// TODO: make the pagination reusable
export const useActivityPagination = (initialFilter: string[] = []) => {
  const [filter, setFilter] = useState<string[]>(initialFilter)
  const [offset, setOffset] = useState(0)
  const [activities, setActivities] = useState<IActivityRowGroup[]>([])
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const [hasMoreData, setHasMoreData] = useState(true)
  const { btcAddress } = useBtcAddress()
  const { ethAddress } = useEthAddress()

  const { data, isValidating, isLoading, mutate } = useSWR(
    ["activity", filter, offset],
    () =>
      getAllActivity({
        filteredContracts: filter,
        offset,
        limit: PAGINATION_ITEMS,
        btcAddress,
        ethAddress,
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
    if (isButtonLoading || isValidating) return

    setIsButtonLoading(true)
    setOffset((prev) => prev + PAGINATION_ITEMS)
    setIsButtonLoading(false)
  }

  const resetHandler = () => {
    setActivities([])
    setOffset(0)
    setHasMoreData(true)
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
    isFirstLoading: isLoading,
  }
}
