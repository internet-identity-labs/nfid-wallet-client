import { ActivityAssetFT } from "packages/integration/src/lib/asset/types"

import { MAX_DECIMAL_USD_LENGTH } from "frontend/features/transfer-modal/utils/validations"
import { Blockchain } from "frontend/ui/connnector/types"

import { PAGINATION_ITEMS } from "../constants"
import { IActivityRow, IActivityRowGroup } from "../types"
import { getExchangeRateForActivity } from "../util/activity"
import { groupActivityRowsByDate } from "../util/row"
import { ActivityClass } from "./activity"
import {
  GetAllActivityParams,
  GetAllActivityResult,
  IActivityConfig,
} from "./activity-connector-types"
import { icActivityConnector } from "./ic/ic-activity-connector"
import { icrc1ActivityConnector } from "./ic/icrc1-activity-connector"

const activityConnectors: {
  [key in Blockchain]: ActivityClass<IActivityConfig>[]
} = {
  [Blockchain.ETHEREUM]: [],
  [Blockchain.POLYGON]: [],
  [Blockchain.POLYGON_MUMBAI]: [],
  [Blockchain.IC]: [icActivityConnector, icrc1ActivityConnector],
  [Blockchain.BITCOIN]: [],
}

export const getAllActivity = async (
  params: GetAllActivityParams,
): Promise<GetAllActivityResult> => {
  const { filteredContracts, offset = 0, limit = PAGINATION_ITEMS } = params
  const activitiesArray = await Promise.all(
    Object.values(activityConnectors)
      .flat()
      .map(async (connector) => {
        try {
          return await connector.getActivitiesRows(filteredContracts)
        } catch (e) {
          console.error(e)
        }
      }),
  )

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

      if (usdRate) {
        const price = Number(usdRate) * Number(asset.amount)

        price < 0.01
          ? (asset.amountUSD = "0.00 USD")
          : (asset.amountUSD = `${price
              .toFixed(MAX_DECIMAL_USD_LENGTH)
              .replace(/\.?0+$/, "")} USD`)
      }
    }
  }

  const isEnd = flattenedData.length > offset + limit

  return { transactions: paginatedGroupedData, isEnd }
}
