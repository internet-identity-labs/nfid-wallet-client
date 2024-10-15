import { SwapTransaction } from "frontend/integration/icpswap/swap-transaction"
import {
  CompleteType,
  SwapStage,
} from "frontend/integration/icpswap/types/enums"

interface ErrorStage {
  buttonText: string
  tooltipText: string
}

export const setErrorAction = (
  transaction: SwapTransaction | undefined,
): ErrorStage | undefined => {
  if (!transaction) return

  const stage = transaction.getStage()

  if (stage === SwapStage.Completed) return

  if (stage === SwapStage.Deposit || stage === SwapStage.TransferSwap) {
    return {
      buttonText: "Cancel swap",
      tooltipText: "deposit",
    }
  }

  if (stage === SwapStage.Swap) {
    return {
      buttonText: "Cancel swap",
      tooltipText: "swap",
    }
  }

  if (stage === SwapStage.Withdraw || stage === SwapStage.TransferNFID) {
    return {
      buttonText: "Complete swap",
      tooltipText: "withdraw",
    }
  }

  throw new Error("Unexpected Stage")
}
