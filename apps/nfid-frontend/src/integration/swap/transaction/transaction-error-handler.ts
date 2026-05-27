import { SignIdentity } from "@icp-sdk/core/agent"
import { SwapTransaction } from "src/integration/swap/swap-transaction"

export interface TransactionErrorHandler {
  completeTransaction(delegation: SignIdentity): Promise<SwapTransaction>
}
