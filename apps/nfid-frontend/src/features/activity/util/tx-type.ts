import { IActivityAction } from "@nfid/integration/token/icrc1/types"

export const getTxType = (txType: IActivityAction) => {
  switch (txType) {
    case "Sent":
      return IActivityAction.SENT
    case "Received":
      return IActivityAction.RECEIVED
    case "Swap":
      return IActivityAction.SWAP
    default:
      return IActivityAction.SENT
  }
}
