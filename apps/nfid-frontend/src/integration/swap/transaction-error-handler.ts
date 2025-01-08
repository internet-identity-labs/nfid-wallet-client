import { SignIdentity } from "@dfinity/agent"
import { SwapTransaction } from "src/integration/swap/icpswap/swap-transaction"

export interface TransactionErrorHandler {
  completeTransaction(delegation: SignIdentity): Promise<SwapTransaction>
}
