import { IActivityAction } from "../types"

export const getTxType = (txType: "sent" | "received" | "swapped") => {
  switch (txType) {
    case "sent":
      return IActivityAction.SENT
    case "received":
      return IActivityAction.RECEIVED
    case "swapped":
      return IActivityAction.SWAPPED
    default:
      return IActivityAction.SENT
  }
}
