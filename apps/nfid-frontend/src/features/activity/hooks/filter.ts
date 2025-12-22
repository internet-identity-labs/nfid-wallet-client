import { useEffect, useState, useCallback } from "react"
import { useSWR } from "@nfid/swr"
import { PAGINATION_ITEMS } from "../constants"
import { IActivityRow, IActivityRowGroup } from "../types"
import { getAllActivity } from "../utils/activity"
import { groupActivityRowsByDate } from "../utils/row"
import { ActivityAssetFT } from "packages/integration/src/lib/asset/types"
import { EVM_NATIVE, ETH_NATIVE_ID } from "@nfid/integration/token/constants"
import { FT } from "frontend/integration/ft/ft"

interface UseActivityFilterParams {
  activeTokens: FT[]
  tokenFilter: string[]
  chainFilter: string[]
  txFilter: string[]
}

export const useActivityFilter = ({
  activeTokens,
  tokenFilter,
  chainFilter,
  txFilter,
}: UseActivityFilterParams) => {
  const [limit, setLimit] = useState(PAGINATION_ITEMS)
  const [activities, setActivities] = useState<IActivityRowGroup[]>([])
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const [hasMoreData, setHasMoreData] = useState(true)
  const [isFirstLoading, setIsFirstLoading] = useState(true)

  const { data, isValidating } = useSWR(
    activeTokens.length > 0 ? ["activity", limit] : null,
    () => getAllActivity(limit, activeTokens),
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  useEffect(() => {
    setActivities([])
    setLimit(PAGINATION_ITEMS)
    setIsFirstLoading(true)
  }, [tokenFilter, chainFilter, txFilter])

  useEffect(() => {
    if (!data) return

    const filteredRows = data.filter((row) => {
      const txMatch =
        txFilter.length === 0 || txFilter.includes(String(row.action))

      const asset = row.asset as ActivityAssetFT
      const canister = asset.canister
      const chainId = asset.chainId

      const tokenMatch =
        tokenFilter.length === 0 ||
        tokenFilter.some((filterValue) => {
          if (canister === ETH_NATIVE_ID) {
            return filterValue === `${ETH_NATIVE_ID}_${chainId}`
          } else if (canister === EVM_NATIVE) {
            return filterValue === `${EVM_NATIVE}_${chainId}`
          } else {
            return filterValue.toLowerCase() === canister.toLowerCase()
          }
        })

      const chainMatch =
        chainFilter.length === 0 || chainFilter.includes(String(chainId))
      return txMatch && tokenMatch && chainMatch
    })

    setActivities((prevActivities) => {
      const allExistingRows = prevActivities.flatMap((group) => group.rows)
      const existingRowIds = new Set(allExistingRows.map((row) => row.id))
      const newRows = filteredRows.filter((row) => !existingRowIds.has(row.id))
      const allRows = [...allExistingRows, ...newRows]
      allRows.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

      const limitedRows = allRows.slice(0, limit)
      const groupedRowsByDate = groupActivityRowsByDate(limitedRows)
      const groupedByDateMap = new Map<string, IActivityRow[]>()

      groupedRowsByDate.forEach(({ date, row }) => {
        if (!groupedByDateMap.has(date)) {
          groupedByDateMap.set(date, [])
        }
        groupedByDateMap.get(date)!.push(row)
      })

      const groupedActivities: IActivityRowGroup[] = Array.from(
        groupedByDateMap.entries(),
      ).map(([date, rows]) => ({
        date,
        rows: rows.sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
        ),
      }))

      groupedActivities.sort(
        (a, b) => b.rows[0].timestamp.getTime() - a.rows[0].timestamp.getTime(),
      )

      return groupedActivities
    })

    setHasMoreData(filteredRows.length >= limit)

    setIsFirstLoading(false)
  }, [data, txFilter, tokenFilter, chainFilter, limit])

  const loadMore = useCallback(async () => {
    if (isButtonLoading || isValidating) return

    setLimit((prev) => prev + PAGINATION_ITEMS)
    setIsButtonLoading(isValidating)
  }, [isValidating, isButtonLoading])

  return {
    activities,
    isValidating,
    hasMoreData,
    loadMore,
    isButtonLoading,
    isFirstLoading,
  }
}
