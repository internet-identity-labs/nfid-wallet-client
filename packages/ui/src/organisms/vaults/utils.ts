import { format } from "date-fns"
import { NS_PER_MS } from "@nfid/integration"
import { PolicyUpdateType } from "./types"

export const memberCreatedToDate = (timestamp: bigint): string => {
  return format(
    new Date(Number(timestamp / NS_PER_MS)),
    "MMM d, yyyy 'at' h:mm:ss aa",
  )
}

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
