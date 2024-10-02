import { SignIdentity } from "@dfinity/agent"
import { SwapTransaction } from "src/integration/icpswap/swap-transaction"
import { CompleteType } from "src/integration/icpswap/types/enums"

export interface TransactionErrorHandler {
  finishTransaction(delegation: SignIdentity): Promise<SwapTransaction>
  getCompleteType(): CompleteType
}
