import { Blockchain } from "frontend/ui/connnector/types"

import { IActivityRowGroup } from "../types"
import { ActivityClass } from "./activity"
import { IActivityConfig } from "./activity-connector-types"
import { ethActivityConnector } from "./evm/eth/eth-activity-connector"
import { icActivityConnector } from "./ic/ic-activity-connector"

const activityConnectors: {
  [key in Blockchain]: ActivityClass<IActivityConfig>[]
} = {
  [Blockchain.ETHEREUM]: [
    ethActivityConnector,
    // ethNFTActivityConnector
    // ethERC20ActivityConnector
  ],
  [Blockchain.ETHEREUM_GOERLI]: [
    // ethGoerliActivityConnector,
    // ethGoerliNFTActivityConnector
    // ethGoerliERC20ActivityConnector
  ],
  [Blockchain.POLYGON]: [
    // polygonActivityConnector,
    // polygonNFTActivityConnector
    // polygonERC20ActivityConnector
  ],
  [Blockchain.POLYGON_MUMBAI]: [
    // polygonMumbaiActivityConnector,
    // polygonMumbaiNFTActivityConnector
    // polygonMumbaiERC20ActivityConnector
  ],
  [Blockchain.IC]: [
    icActivityConnector,
    // icNFTActivityConnector
    // icDIP20ActivityConnector
  ],
  [Blockchain.BITCOIN]: [
    // btcActivityConnector,
  ],
}

export const getAllActivity = async (): Promise<IActivityRowGroup[]> => {
  const activitiesArray = await Promise.all(
    Object.values(activityConnectors)
      .flat()
      .map(async (connector) => {
        try {
          return await connector.getGroupedActivitiesRows()
        } catch (e) {
          console.error(e)
        }
      }),
  )

  return activitiesArray
    .flat()
    .filter((g) => g?.rows.length) as IActivityRowGroup[]
}
