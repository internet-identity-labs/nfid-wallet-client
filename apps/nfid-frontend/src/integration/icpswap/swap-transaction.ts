import {SwapTransaction as SwapTransactionCandid} from "src/integration/icpswap/idl/swap_trs_storage.d"
import {Quote} from "src/integration/icpswap/quote"
import {SwapStage} from "src/integration/icpswap/types/enums"
import {Icrc1TransferError} from "@dfinity/ledger-icp/dist/candid/ledger";
import {Error as ErrorSwap} from "./idl/SwapPool.d"
import {TransactionErrorHandler} from "src/integration/icpswap/transaction-error-handler";


export interface SwapTransaction {
  getStage(): SwapStage

  getErrorHandler(): TransactionErrorHandler

  toCandid(quote: Quote): SwapTransactionCandid

  fromCandid(candid: SwapTransactionCandid): SwapTransaction

  getStartTime(): number

  getTransferId(): bigint | undefined

  getTransferNFIDId(): bigint | undefined

  getDeposit(): bigint | undefined

  getSwap(): bigint | undefined

  getWithdraw(): bigint | undefined

  getEndTime(): number | undefined

  getError(): ErrorSwap | Icrc1TransferError | undefined | string

  getStage(): SwapStage

  getTargetLedger(): string

  getSourceLedger(): string

  getAmount(): number

  setDeposit(deposit: bigint): void

  setSwap(swap: bigint | undefined): void

  setError(error: ErrorSwap | Icrc1TransferError | undefined | string): void

  getQuote(): number

  setTransferId(transferId: bigint): void

  setNFIDTransferId(transferId: bigint): void

  setWithdraw(withdraw: bigint): void
}
