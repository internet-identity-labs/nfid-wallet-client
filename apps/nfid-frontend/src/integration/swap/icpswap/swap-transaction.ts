import { Icrc1TransferError } from "@dfinity/ledger-icp/dist/candid/ledger"
import { SwapTransaction as SwapTransactionCandid } from "src/integration/swap/icpswap/idl/swap_trs_storage.d"
import { SwapStage } from "src/integration/swap/types/enums"

import { Error as ErrorSwap } from "./idl/SwapPool.d"

export interface SwapTransaction {
  getStage(): SwapStage

  toCandid(): SwapTransactionCandid

  fromCandid(candid: SwapTransactionCandid): SwapTransaction

  getStartTime(): number

  getEndTime(): number | undefined

  getTransferNFIDId(): bigint | undefined

  getErrors(): Array<SwapError>

  getTargetLedger(): string

  getSourceLedger(): string

  getSourceAmount(): bigint

  setError(error: ErrorSwap | Icrc1TransferError | undefined | string): void



  getTransferId(): bigint | undefined

  getDeposit(): bigint | undefined

  getSwap(): bigint | undefined

  getWithdraw(): bigint | undefined

  setDeposit(deposit: bigint): void

  setSwap(swap: bigint | undefined): void

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
