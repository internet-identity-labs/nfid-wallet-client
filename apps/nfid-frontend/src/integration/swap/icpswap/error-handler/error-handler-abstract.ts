import { SignIdentity } from "@dfinity/agent"
import { SwapTransaction } from "src/integration/swap/icpswap/swap-transaction"
import { TransactionErrorHandler } from "src/integration/swap/transaction-error-handler"

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
