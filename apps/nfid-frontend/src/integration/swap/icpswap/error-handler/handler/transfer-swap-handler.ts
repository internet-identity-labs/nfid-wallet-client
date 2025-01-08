import { TransactionErrorHandlerAbstract } from "src/integration/swap/icpswap/error-handler/error-handler-abstract"
import { swapTransactionService } from "src/integration/swap/icpswap/service/transaction-service"
import { SwapTransaction } from "src/integration/swap/icpswap/swap-transaction"

export class TransferSwapHandler extends TransactionErrorHandlerAbstract {
  async completeTransaction(): Promise<SwapTransaction> {
    console.debug("Trying to complete")
    this.getTransaction().setCompleted()
    await swapTransactionService.storeTransaction(
      this.getTransaction().toCandid(),
    )
    return this.getTransaction()
  }
}
