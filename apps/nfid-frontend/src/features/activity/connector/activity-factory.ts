import { Blockchain } from "frontend/ui/connnector/types"

import { IActivityRow, IActivityRowGroup } from "../types"
import { groupActivityRowsByDate } from "../util/row"
import { ActivityClass } from "./activity"
import { IActivityConfig } from "./activity-connector-types"
import { btcActivityConnector } from "./btc/btc-activity-connector"
import { ethActivityConnector } from "./evm/eth/eth-activity-connector"
import { polygonMumbaiActivityConnector } from "./evm/polygon-mumbai/polygon-mumbai-activity-connector"
import { polygonActivityConnector } from "./evm/polygon/polygon-activity-connector"
import { icActivityConnector } from "./ic/ic-activity-connector"

const activityConnectors: {
  [key in Blockchain]: ActivityClass<IActivityConfig>[]
} = {
  [Blockchain.ETHEREUM]: [ethActivityConnector],
  [Blockchain.POLYGON]: [polygonActivityConnector],
  [Blockchain.POLYGON_MUMBAI]: [polygonMumbaiActivityConnector],
  [Blockchain.IC]: [icActivityConnector],
  [Blockchain.BITCOIN]: [btcActivityConnector],
}

export const getAllActivity = async (): Promise<IActivityRowGroup[]> => {
  const activitiesArray = await Promise.all(
    Object.values(activityConnectors)
      .flat()
      .map(async (connector) => {
        try {
          return await connector.getActivitiesRows()
        } catch (e) {
          console.error(e)
        }
      }),
  )

  const notEmptyActivitiesArrays = activitiesArray.filter((a) => !!a)

  const groupedRowsByDate = groupActivityRowsByDate(
    notEmptyActivitiesArrays.flat() as IActivityRow[],
  )

  return groupedRowsByDate
}
