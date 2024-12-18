import { SignIdentity } from "@dfinity/agent"
import { SwapTransaction } from "src/integration/icpswap/swap-transaction"

export interface TransactionErrorHandler {
  completeTransaction(delegation: SignIdentity): Promise<SwapTransaction>
}
