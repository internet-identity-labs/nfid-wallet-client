import { SignIdentity } from "@dfinity/agent"
import { TransactionErrorHandlerAbstract } from "src/integration/icpswap/error-handler/error-handler-abstract"
import { swapTransactionService } from "src/integration/icpswap/service/transaction-service"
import { SwapTransaction } from "src/integration/icpswap/swap-transaction"
import { CompleteType } from "src/integration/icpswap/types/enums"

export class TransferSwapHandler extends TransactionErrorHandlerAbstract {
  async completeTransaction(
    delegation: SignIdentity,
  ): Promise<SwapTransaction> {
    console.debug("Trying to complete")
    this.getTransaction().setCompleted()
    await swapTransactionService.storeTransaction(
      this.getTransaction().toCandid(),
      delegation,
    )
    return this.getTransaction()
  }
  getCompleteType(): CompleteType {
    return CompleteType.Rollback
  }
}
