import { Transaction } from "@nfid/vaults"
import { format } from "date-fns"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { IActivityAction } from "@nfid/integration/token/icrc1/types"
import { IActivityRow } from "frontend/features/activity/types"
import { ActivityAssetFT } from "packages/integration/src/lib/asset/types"
import { NS_PER_MS } from "@nfid/integration"
import { IVaultRow, PolicyUpdateType } from "./types"

export const vaultTxTimestampToDate = (timestamp: bigint): string => {
  return format(new Date(Number(timestamp / NS_PER_MS)), "MMMM d, yyyy")
}

export const vaultTxTimestampToTime = (timestamp: bigint): string => {
  return format(
    new Date(Number(timestamp / NS_PER_MS)),
    "hh:mm:ss aa",
  ).toLowerCase()
}

export const memberCreatedToDate = (timestamp: bigint): string => {
  return format(
    new Date(Number(timestamp / NS_PER_MS)),
    "MMM d, yyyy 'at' h:mm:ss aa",
  )
}

// export function txToVaultRows(
//   transaction: Transaction,
// ): IVaultRow[] {
//   return transaction.approves.map((approve): IVaultRow => ({
//     id: `${transaction.id}_${approve.signer}`,
//     action: approve.status as unknown as IActivityAction,
//     timestamp: new Date(Number(approve.createdDate / NS_PER_MS)),
//     from: approve.signer,
//     to: transaction.initiator,
//   }))
// }

export const renderPolicyUpdateTitle = (type: PolicyUpdateType | null) => {
  switch (type) {
    case PolicyUpdateType.THRESHOLD:
      return "Update approval threshold"
    case PolicyUpdateType.ADD_APPROVER:
      return "Add approver"
    case PolicyUpdateType.EDIT_APPROVER:
      return "Edit approver"
    case PolicyUpdateType.REMOVE_APPROVER:
      return "Remove approver"
    default:
      return null
  }
}
