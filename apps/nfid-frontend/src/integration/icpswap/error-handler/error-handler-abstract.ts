import { SignIdentity } from "@dfinity/agent"
import { SwapTransaction } from "src/integration/icpswap/swap-transaction"
import { TransactionErrorHandler } from "src/integration/icpswap/transaction-error-handler"

export abstract class TransactionErrorHandlerAbstract
  implements TransactionErrorHandler
{
  private readonly transaction: SwapTransaction

  constructor(transaction: SwapTransaction) {
    this.transaction = transaction
  }

  abstract completeTransaction(
    delegation: SignIdentity,
  ): Promise<SwapTransaction>

  protected getTransaction(): SwapTransaction {
    return this.transaction
  }
}
