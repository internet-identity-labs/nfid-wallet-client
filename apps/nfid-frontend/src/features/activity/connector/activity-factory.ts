import { ActivityAssetFT } from "packages/integration/src/lib/asset/types"

import { MAX_DECIMAL_LENGTH } from "@nfid/integration/token/constants"
import { toPresentationIcrc1 } from "@nfid/integration/token/utils"

import { Blockchain } from "frontend/ui/connnector/types"

import { IActivityRow, IActivityRowGroup } from "../types"
import { getExchangeRate } from "../util/activity"
import { groupActivityRowsByDate } from "../util/row"
import { ActivityClass } from "./activity"
import { IActivityConfig } from "./activity-connector-types"
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
  filteredCanisters: string[],
  offset = 0,
  limit = 10,
): Promise<{ transactions: IActivityRowGroup[]; isEnd: boolean }> => {
  const activitiesArray = await Promise.all(
    Object.values(activityConnectors)
      .flat()
      .map(async (connector) => {
        try {
          const activityRows = await connector.getActivitiesRows(
            filteredCanisters,
          )
          return activityRows
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

      const usdRate = await getExchangeRate(
        asset,
        row.timestamp,
        asset.decimals,
      )
      asset.amountUSD =
        usdRate !== undefined
          ? toPresentationIcrc1(
              usdRate *
                BigInt(
                  Math.abs(
                    Math.round(+asset.amount * 10 ** MAX_DECIMAL_LENGTH),
                  ),
                ),
              asset.decimals,
              true,
              true,
            ) + " USD"
          : undefined
    }
  }

  const isEnd = flattenedData.length > offset + limit

  return { transactions: paginatedGroupedData, isEnd }
}
