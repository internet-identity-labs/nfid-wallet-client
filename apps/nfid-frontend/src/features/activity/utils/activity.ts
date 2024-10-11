import axios from "axios"
import { PriceService } from "packages/integration/src/lib/asset/asset-util"
import { ActivityAssetFT } from "packages/integration/src/lib/asset/types"
import { wrappedTokenMap } from "packages/integration/src/lib/asset/wrapped-token-map"

import { PAGINATION_ITEMS } from "../constants"
import {
  GetAllActivityParams,
  GetAllActivityResult,
  IActivityRow,
  IActivityRowGroup,
} from "../types"
import { getIcrc1ActivitiesRows } from "./icrc1-activity"
import { groupActivityRowsByDate } from "./row"
import { getSwapActivitiesRows } from "./swap-activity"

export const getAllActivity = async (
  params: GetAllActivityParams,
): Promise<GetAllActivityResult> => {
  const { filteredContracts, offset = 0, limit = PAGINATION_ITEMS } = params

  const [icrc1Activities, swapActivities] = await Promise.all([
    getIcrc1ActivitiesRows(filteredContracts),
    getSwapActivitiesRows(filteredContracts),
  ])

  const activitiesArray = [...icrc1Activities, ...swapActivities]

  const notEmptyActivitiesArrays = activitiesArray.filter((a) => !!a)

  const groupedRowsByDate = groupActivityRowsByDate(
    notEmptyActivitiesArrays.flat() as IActivityRow[],
  )

  const flattenedData: { date: string; row: IActivityRow }[] = []

  groupedRowsByDate.forEach((group) => {
    group.rows.forEach((row: IActivityRow) => {
      flattenedData.push({ date: group.date, row })
    })
  })

  const paginatedData = flattenedData.slice(offset, offset + limit)

  const paginatedGroupedData = paginatedData.reduce(
    (
      acc: IActivityRowGroup[],
      current: { date: string; row: IActivityRow },
    ) => {
      const group = acc.find((group) => group.date === current.date)
      if (group) {
        group.rows.push(current.row)
      } else {
        acc.push({ date: current.date, rows: [current.row] })
      }
      return acc
    },
    [],
  )

  for (const group of paginatedGroupedData) {
    for (const row of group.rows) {
      const asset = row.asset as ActivityAssetFT
      const usdRate = await getExchangeRateForActivity(asset, row.timestamp)
      asset.rate = usdRate
    }
  }

  const isEnd = flattenedData.length > offset + limit

  return { transactions: paginatedGroupedData, isEnd }
}

export const nanoSecondsToDate = (nanoSeconds: bigint): Date => {
  const milliseconds = Number(nanoSeconds / BigInt(1000000))
  return new Date(milliseconds)
}

export const getHistoricalExchangeRate = async (
  pair: string,
  date: Date,
): Promise<number | undefined> => {
  const end = new Date(date.getTime() + 1 * 60000)
  const currentDate = new Date()
  if (end > currentDate) {
    const awsRate = await new PriceService().getPrice([pair.split("-")[0]])
    return Number(awsRate[0].price)
  }

  const url = `https://api.pro.coinbase.com/products/${pair}/candles`

  try {
    const response = await axios.get(url, {
      params: {
        start: date.toISOString(),
        end: end.toISOString(),
        granularity: 60,
      },
    })

    return response.data[0][1]
  } catch (error) {
    console.debug(error)
    return undefined
  }
}

export const getExchangeRateForActivity = async (
  asset: ActivityAssetFT,
  date: Date,
): Promise<number | undefined> => {
  const tokensToGetPrice: { [key: string]: string } = {
    ...wrappedTokenMap,
    ICP: "ICP",
  }
  const symbol = tokensToGetPrice[asset.currency]

  if (!symbol) return undefined

  if (symbol === "USDC") {
    return 1
  } else {
    return await getHistoricalExchangeRate(`${symbol}-USD`, date)
  }
}
