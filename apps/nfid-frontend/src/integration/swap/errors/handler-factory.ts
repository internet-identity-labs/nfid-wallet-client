import { IcpSwapDepositHandler } from "src/integration/swap/icpswap/error-handler/handler/icp-swap-deposit-handler"
import { IcpSwapSwapHandler } from "src/integration/swap/icpswap/error-handler/handler/icp-swap-swap-handler"
import { IcpSwapTransferNfidHandler } from "src/integration/swap/icpswap/error-handler/handler/icp-swap-transfer-nfid-handler"
import { IcpSwapWithdrawHandler } from "src/integration/swap/icpswap/error-handler/handler/icp-swap-withdraw-handler"
import { TransferSwapHandler } from "src/integration/swap/icpswap/error-handler/handler/transfer-swap-handler"
import { KongswapSwapHandler } from "src/integration/swap/kong/error-handler/error-shroff/kongswap-swap-handler"
import { KongSwapTransferNfidHandler } from "src/integration/swap/kong/error-handler/nfid-handler"
import { SwapTransaction } from "src/integration/swap/swap-transaction"
import { TransactionErrorHandler } from "src/integration/swap/transaction/transaction-error-handler"
import { SwapName, SwapStage } from "src/integration/swap/types/enums"

export class ErrorHandlerFactory {
  getHandler(transaction: SwapTransaction): TransactionErrorHandler {
    if (transaction.getStage() === SwapStage.Completed) {
      throw new Error("Transaction already completed")
    }
    if (transaction.getStage() === SwapStage.TransferSwap) {
      return new TransferSwapHandler(transaction)
    }
    switch (transaction.getProvider()) {
      case SwapName.ICPSwap:
        if (transaction.getStage() === SwapStage.TransferNFID) {
          return new IcpSwapTransferNfidHandler(transaction)
        }
        if (transaction.getStage() === SwapStage.Deposit) {
          return new IcpSwapDepositHandler(transaction)
        }
        if (transaction.getStage() === SwapStage.Swap) {
          return new IcpSwapSwapHandler(transaction)
        }
        if (transaction.getStage() === SwapStage.Withdraw) {
          return new IcpSwapWithdrawHandler(transaction)
        }
        throw new Error("Unsupported IcpSwap error")
      case SwapName.Kongswap: {
        const swapStages = new Set([
          SwapStage.TransferSwap,
          SwapStage.Deposit,
          SwapStage.Swap,
        ])
        if (swapStages.has(SwapStage.Swap)) {
          return new KongswapSwapHandler(transaction)
        }
        if (transaction.getStage() === SwapStage.TransferNFID) {
          return new KongSwapTransferNfidHandler(transaction)
        }
        throw new Error("Unsupported KongSwap error")
      }
    }
  }
}

export const errorHandlerFactory = new ErrorHandlerFactory()
