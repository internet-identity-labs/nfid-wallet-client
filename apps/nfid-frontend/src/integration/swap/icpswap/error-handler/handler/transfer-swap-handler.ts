import { TransactionErrorHandlerAbstract } from "src/integration/swap/errors/error-handler-abstract"
import { SwapTransaction } from "src/integration/swap/swap-transaction"
import { swapTransactionService } from "src/integration/swap/transaction/transaction-service"

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
