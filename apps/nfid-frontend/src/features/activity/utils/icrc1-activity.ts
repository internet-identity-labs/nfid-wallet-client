import { Activity } from "packages/integration/src/lib/asset/types"

import { getICRC1HistoryDataForUser } from "@nfid/integration/token/icrc1"
import {
  ICRC1IndexData,
  TransactionData,
} from "@nfid/integration/token/icrc1/types"

import { IActivityRow } from "../types"
import { nanoSecondsToDate } from "./activity"
import { authState } from "@nfid/integration"

const filterActivitiesByCanisterId = (
  canisterIds: string[] = [],
  allCanistersActivities: ICRC1IndexData[],
): TransactionData[] => {
  let activities: TransactionData[]
  if (!canisterIds.length) {
    activities = allCanistersActivities.flatMap(
      (activity) => activity.transactions,
    )
  } else {
    activities = allCanistersActivities
      .filter((activity) => canisterIds.includes(activity.canisterId!))
      .flatMap((activity) => activity.transactions)
  }

  return activities
}

const getActivities = async (
  canisterIds: string[],
  limit: number,
): Promise<Activity[]> => {
  const { userId, publicKey } = authState.getUserIdData()
  const allCanistersActivities = await getICRC1HistoryDataForUser(
    userId!,
    publicKey,
    BigInt(limit),
  )

  return filterActivitiesByCanisterId(canisterIds, allCanistersActivities).map(
    (tx: TransactionData) =>
      ({
        id: tx.transactionId.toString(),
        date: new Date(nanoSecondsToDate(tx.timestamp)),
        from: tx.from,
        to: tx.to,
        transactionHash: tx.transactionId.toString(),
        action: tx.type,
        asset: {
          type: "ft",
          currency: tx.symbol,
          decimals: tx.decimals,
          amount: Number(tx.amount),
          canister: tx.canister,
        },
      } as Activity),
  )
}

const mapActivitiesToRows = (activities: Activity[]): IActivityRow[] => {
  return activities.map((activity) => ({
    id: activity.id,
    action: activity.action,
    asset: activity.asset,
    type: activity.asset.type,
    timestamp: activity.date,
    from: activity.from,
    to: activity.to,
  }))
}

export const getIcrc1ActivitiesRows = async (
  filteredContracts: string[] = [],
  limit: number,
): Promise<IActivityRow[]> => {
  const activities = await getActivities(filteredContracts, limit)
  const activitiesRows = mapActivitiesToRows(activities)

  return activitiesRows
}
