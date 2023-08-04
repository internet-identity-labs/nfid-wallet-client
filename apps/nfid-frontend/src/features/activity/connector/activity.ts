import { DelegationIdentity } from "@dfinity/identity"

import { authState } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

import { IActivityRow, IActivityRowGroup } from "../types"
import { groupActivityRowsByDate } from "../util/row"
import {
  IActivity,
  IActivityConfig,
  IActivityConnector,
  IActivityDetails,
} from "./types"

export abstract class ActivityClass<T extends IActivityConfig>
  implements IActivityConnector
{
  public config: T

  constructor(config: T) {
    this.config = config
  }

  getTokenConfig(): T {
    return this.config
  }

  getTokenStandard(): TokenStandards {
    return this.config.tokenStandard
  }

  getIdentity(): DelegationIdentity {
    return authState.get().delegationIdentity as DelegationIdentity
  }

  mapActivitiesToRows(
    activities: IActivity[],
    config: IActivityConfig,
  ): IActivityRow[] {
    return activities.map((activity: IActivity) => ({
      action: activity.action,
      chain: config.chain,
      asset: {
        type: "ft",
        amount: activity.asset.amount,
        amountUSD: activity.asset.amountUSD,
        currency: "ETH",
      },
      type: activity.asset.type,
      from: activity.from,
      timestamp: activity.date,
      to: activity.to,
    }))
  }

  async getGroupedActivitiesRows(): Promise<IActivityRowGroup[]> {
    const activities = await this.getActivities()
    const activitiesRows = this.mapActivitiesToRows(activities, this.config)

    return groupActivityRowsByDate(activitiesRows)
  }

  abstract getActivities(): Promise<IActivity[]>
  abstract getActivityDetails(row: IActivityRow): Promise<IActivityDetails>
}
