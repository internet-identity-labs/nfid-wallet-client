import {CompleteType} from "src/integration/icpswap/types/enums";
import {SignIdentity} from "@dfinity/agent";
import {SwapTransaction} from "src/integration/icpswap/swap-transaction";

export interface TransactionErrorHandler {
  finishTransaction(delegation: SignIdentity): Promise<SwapTransaction>
  getCompleteType() : CompleteType
}
