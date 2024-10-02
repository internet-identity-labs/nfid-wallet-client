import { SwapTransaction as SwapTransactionCandid } from "src/integration/icpswap/idl/swap_trs_storage.d"
import { Quote } from "src/integration/icpswap/quote"
import { SwapStage } from "src/integration/icpswap/types/enums"

export interface SwapTransaction {
  getStage(): SwapStage
  toCandid(quote: Quote): SwapTransactionCandid
  fromCandid(candid: SwapTransactionCandid): SwapTransaction
}
