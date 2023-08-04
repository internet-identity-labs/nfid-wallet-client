import { FungibleActivityRecord } from "packages/integration/src/lib/asset/types"

import { IActivity } from "../connector/types"
import { IActivityAction } from "../types"

export const ethRecordsToActivities = (
  records: FungibleActivityRecord[],
): IActivity[] => {
  return records.map((record) => ({
    id: record.id,
    date: record.date,
    from: record.from,
    to: record.to,
    transactionHash: record.transactionHash,
    action: IActivityAction.SEND,
    asset: {
      amount: String(record.price),
      amountUSD: String(record.price),
      currency: "ETH",
      type: "ft",
    },
  }))
}
