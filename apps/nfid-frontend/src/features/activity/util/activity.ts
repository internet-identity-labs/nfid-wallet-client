import {
  ActivityRecord,
  NonFungibleActivityRecords,
} from "packages/integration/src/lib/asset/types"

import { IActivity } from "../connector/types"

export const ethRecordsToActivities = (
  records: NonFungibleActivityRecords,
): IActivity[] => {
  return records.activities.map((record: ActivityRecord) => ({
    id: record.id,
    date: record.date,
    from: record.from,
    to: record.to,
    transactionHash: record.transactionHash,
    action: record.type as any, // ACTIVITY
    asset: {
      amount: String(record.price),
      amountUSD: String(record.priceUsd),
      currency: "ETH",
      type: "ft",
    },
  }))
}
