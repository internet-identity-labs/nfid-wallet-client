import { ActivityAssetFT } from "packages/integration/src/lib/asset/types"

import { exchangeRateService } from "@nfid/integration"

import { getBtcActivitiesRows } from "frontend/integration/bitcoin/services/btc-transaction-service"
import { getEthActivitiesRows } from "frontend/integration/etherium/eth-transaction.service"

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

export const getAllActivity = async ({
  btcAddress,
  ethAddress,
  ...params
}: GetAllActivityParams): Promise<GetAllActivityResult> => {
  const { filteredContracts, offset = 0, limit = PAGINATION_ITEMS } = params

  const [icrc1Activities, swapActivities, btcActivities, ethActivities] =
    await Promise.all([
      getIcrc1ActivitiesRows(filteredContracts, limit),
      getSwapActivitiesRows(filteredContracts),
      getBtcActivitiesRows(btcAddress),
      getEthActivitiesRows(ethAddress),
    ])

  const activitiesArray = [
    ...icrc1Activities,
    ...swapActivities,
    ...btcActivities,
    ...ethActivities,
  ]

  const groupedRowsByDate = groupActivityRowsByDate(
    activitiesArray.flat() as IActivityRow[],
  )

  const paginatedData = groupedRowsByDate.slice(offset, offset + limit)

  const paginatedDataUsdRate = await Promise.all(
    paginatedData.map(async (item) => {
      const asset = item.row.asset as ActivityAssetFT
      let usdRate
      try {
        usdRate = await exchangeRateService.usdPriceForICRC1(asset.canister)
      } catch (e) {
        console.error("Exchange rate error: ", e)
      }

      return {
        ...item,
        row: {
          ...item.row,
          asset: {
            ...item.row.asset,
            rate: Number(usdRate?.value.toFixed(2)),
          },
        },
      }
    }),
  )

  const paginatedGroupedData = paginatedDataUsdRate.reduce(
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

  const isEnd = groupedRowsByDate.length > offset + limit

  return { transactions: paginatedGroupedData, isEnd }
}

export const nanoSecondsToDate = (nanoSeconds: bigint): Date => {
  const milliseconds = Number(nanoSeconds / BigInt(1000000))
  return new Date(milliseconds)
}
