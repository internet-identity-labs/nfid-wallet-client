import { SignIdentity } from "@dfinity/agent"
import { SwapTransaction } from "src/integration/icpswap/swap-transaction"
import { TransactionErrorHandler } from "src/integration/icpswap/transaction-error-handler"
import { CompleteType } from "src/integration/icpswap/types/enums"

export abstract class TransactionErrorHandlerAbstract
  implements TransactionErrorHandler
{
  private readonly transaction: SwapTransaction

  constructor(transaction: SwapTransaction) {
    this.transaction = transaction
  }

  abstract finishTransaction(delegation: SignIdentity): Promise<SwapTransaction>

  abstract getCompleteType(): CompleteType

  protected getTransaction(): SwapTransaction {
    return this.transaction
  }
}
