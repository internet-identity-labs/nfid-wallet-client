import { SignIdentity } from "@dfinity/agent"
import { TransactionErrorHandlerAbstract } from "src/integration/icpswap/error-handler/error-handler-abstract"
import { SwapTransaction } from "src/integration/icpswap/swap-transaction"
import { CompleteType } from "src/integration/icpswap/types/enums"

export class TransferSwapHandler extends TransactionErrorHandlerAbstract {
  finishTransaction(delegation: SignIdentity): Promise<SwapTransaction> {
    //todo: return assets from NFID ledger
    throw new Error("Method not implemented.")
  }
  getCompleteType(): CompleteType {
    return CompleteType.Rollback
  }
}
