import { Icrc1TransferError } from "@dfinity/ledger-icp/dist/candid/ledger"
import { SwapTransaction as SwapTransactionCandid } from "src/integration/swap/icpswap/idl/swap_trs_storage.d"
import { SwapStage } from "src/integration/swap/icpswap/types/enums"

import { Error as ErrorSwap } from "./idl/SwapPool.d"

export interface SwapTransaction {
  getStage(): SwapStage

  toCandid(): SwapTransactionCandid

  fromCandid(candid: SwapTransactionCandid): SwapTransaction

  getStartTime(): number

  getTransferId(): bigint | undefined

  getTransferNFIDId(): bigint | undefined

  getDeposit(): bigint | undefined

  getSwap(): bigint | undefined

  getWithdraw(): bigint | undefined

  getEndTime(): number | undefined

  getErrors(): Array<SwapError>

  getTargetLedger(): string

  getSourceLedger(): string

  getSourceAmount(): bigint

  setDeposit(deposit: bigint): void

  setSwap(swap: bigint | undefined): void

  setError(error: ErrorSwap | Icrc1TransferError | undefined | string): void

  getQuote(): number

  setTransferId(transferId: bigint): void

  setNFIDTransferId(transferId: bigint): void

  setWithdraw(withdraw: bigint): void

  setCompleted(): void

  getIsLoading(): boolean

  setIsLoading(value: boolean): void
}

export interface SwapError {
  time: bigint
  message: string
}
