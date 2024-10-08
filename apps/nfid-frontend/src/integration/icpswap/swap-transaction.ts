import { SwapTransaction as SwapTransactionCandid } from "src/integration/icpswap/idl/swap_trs_storage.d"
import { Quote } from "src/integration/icpswap/quote"
import { SwapStage } from "src/integration/icpswap/types/enums"

import { DepositError, SwapError, WithdrawError } from "./errors"

export interface SwapTransaction {
  getStage(): SwapStage

  toCandid(quote: Quote): SwapTransactionCandid

  fromCandid(candid: SwapTransactionCandid): SwapTransaction

  getStartTime(): number

  getTransferId(): bigint | undefined

  getTransferNFIDId(): bigint | undefined

  getDeposit(): bigint | undefined

  getSwap(): bigint | undefined

  getWithdraw(): bigint | undefined

  getEndTime(): number | undefined

  getError(): DepositError | SwapError | WithdrawError | undefined

  getStage(): SwapStage

  getTargetLedger(): string

  getSourceLedger(): string

  getSourceAmount(): bigint

  setDeposit(deposit: bigint): void

  setSwap(swap: bigint | undefined): void

  setError(error: SwapError | DepositError | WithdrawError | undefined): void

  getQuote(): number

  setTransferId(transferId: bigint): void

  setNFIDTransferId(transferId: bigint): void

  setWithdraw(withdraw: bigint): void
}
