import { Icrc1TransferError } from "@dfinity/ledger-icp/dist/candid/ledger"

import { SwapTransaction as SwapTransactionCandid } from "src/integration/swap/transaction/idl/swap_trs_storage.d"
import { SwapName, SwapStage } from "src/integration/swap/types/enums"

import { Error as ErrorSwap } from "./icpswap/idl/SwapPool.d"

//TODO make this ICP/Kong Specific
export interface SwapTransaction {
  getProvider(): SwapName

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

  setCompleted(): void

  getIsLoading(): boolean

  setIsLoading(value: boolean): void

  setNFIDTransferId(transferId: bigint): void

  //TODO move this under IcpSwapTrs

  getTransferId(): bigint | undefined

  getDeposit(): bigint | undefined

  getSwap(): bigint | undefined

  getSwapName(): SwapName

  getWithdraw(): bigint | undefined

  setDeposit(deposit: bigint): void

  setSwap(swap: bigint | undefined): void

  getQuote(): number

  setTransferId(transferId: bigint): void

  setWithdraw(withdraw: bigint): void
}

export interface SwapError {
  time: bigint
  message: string
}
