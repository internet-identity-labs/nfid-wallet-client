import { DepositHandler } from "src/integration/icpswap/error-handler/handler/deposit-handler"
import { SwapHandler } from "src/integration/icpswap/error-handler/handler/swap-handler"
import { TransferNfidHandler } from "src/integration/icpswap/error-handler/handler/transfer-nfid-handler"
import { TransferSwapHandler } from "src/integration/icpswap/error-handler/handler/transfer-swap-handler"
import { WithdrawHandler } from "src/integration/icpswap/error-handler/handler/withdraw-handler"
import { SwapTransaction } from "src/integration/icpswap/swap-transaction"
import { TransactionErrorHandler } from "src/integration/icpswap/transaction-error-handler"
import { SwapStage } from "src/integration/icpswap/types/enums"

export class ErrorHandlerFactory {
  getHandler(transaction: SwapTransaction): TransactionErrorHandler {
    if (transaction.getStage() === SwapStage.Completed) {
      throw new Error("Transaction already completed")
    }

    if (transaction.getStage() === SwapStage.TransferNFID) {
      return new TransferNfidHandler(transaction)
    }

    if (transaction.getStage() === SwapStage.TransferSwap) {
      return new TransferSwapHandler(transaction)
    }

    if (transaction.getStage() === SwapStage.Deposit) {
      return new DepositHandler(transaction)
    }

    if (transaction.getStage() === SwapStage.Swap) {
      console.log("SwapStage.Swap")
      return new SwapHandler(transaction)
    }

    if (transaction.getStage() === SwapStage.Withdraw) {
      return new WithdrawHandler(transaction)
    }

    throw new Error("Unsupported stage")
  }
}

export const errorHandlerFactory = new ErrorHandlerFactory()
