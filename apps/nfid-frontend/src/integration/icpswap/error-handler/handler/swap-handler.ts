import { SignIdentity } from "@dfinity/agent"
import { TransactionErrorHandlerAbstract } from "src/integration/icpswap/error-handler/error-handler-abstract"
import { SwapTransaction } from "src/integration/icpswap/swap-transaction"
import { CompleteType } from "src/integration/icpswap/types/enums"

export class SwapHandler extends TransactionErrorHandlerAbstract {
  completeTransaction(delegation: SignIdentity): Promise<SwapTransaction> {
    //TODO: finish withdraw assets
    throw new Error("Method not implemented.")
  }
  getCompleteType(): CompleteType {
    return CompleteType.Rollback
  }
}
