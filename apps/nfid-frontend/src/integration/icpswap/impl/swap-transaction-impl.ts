import {Icrc1TransferError} from "@dfinity/ledger-icp/dist/candid/ledger"
import randomUUID, {UUID} from "crypto"
import {Quote} from "src/integration/icpswap/quote"
import {SwapTransaction} from "src/integration/icpswap/swap-transaction"
import {SwapStage} from "src/integration/icpswap/types/enums"

import {hasOwnProperty} from "@nfid/integration"

import {Error as ErrorSwap} from "./../idl/SwapPool.d"
import {SwapStage as SwapStageCandid, SwapTransaction as SwapTransactionCandid,} from "./../idl/swap_trs_storage.d"

export class SwapTransactionImpl implements SwapTransaction {
  private uid: UUID
  private startTime: number
  private transferId: bigint | undefined
  private sourceAmount: bigint
  private transferNFIDId: bigint | undefined
  private deposit: bigint | undefined
  private quote: number
  private swap: bigint | undefined
  private withdraw: bigint | undefined
  private endTime: number | undefined
  private error: ErrorSwap | Icrc1TransferError | undefined | string
  private stage: SwapStage
  private readonly targetLedger: string
  private readonly sourceLedger: string

  constructor(
    targetLedger: string,
    sourceLedger: string,
    quote: number,
    amount: bigint,
  ) {
    this.startTime = Date.now()
    this.stage = SwapStage.TransferNFID
    this.targetLedger = targetLedger
    this.sourceLedger = sourceLedger
    this.uid = randomUUID.randomUUID()
    this.quote = quote
    this.sourceAmount = amount
  }

  getStartTime(): number {
    return this.startTime
  }

  getTransferId(): bigint | undefined {
    return this.transferId
  }

  getTransferNFIDId(): bigint | undefined {
    return this.transferNFIDId
  }

  getDeposit(): bigint | undefined {
    return this.deposit
  }

  getSwap(): bigint | undefined {
    return this.swap
  }

  getWithdraw(): bigint | undefined {
    return this.withdraw
  }

  getEndTime(): number | undefined {
    return this.endTime
  }

  getError(): ErrorSwap | Icrc1TransferError | undefined | string {
    return this.error
  }

  getTargetLedger(): string {
    return this.targetLedger
  }

  getSourceLedger(): string {
    return this.sourceLedger
  }

  getStage(): SwapStage {
    return this.stage
  }

  getQuote(): number {
    return this.quote
  }

  getSourceAmount(): bigint {
    return this.sourceAmount
  }

  setTransferId(transferId: bigint) {
    this.transferId = transferId
    this.stage = SwapStage.Deposit
  }

  setNFIDTransferId(transferId: bigint) {
    this.transferNFIDId = transferId
    this.stage = SwapStage.TransferSwap
  }

  setDeposit(deposit: bigint) {
    this.deposit = deposit
    this.stage = SwapStage.Swap
  }

  setSwap(swap: bigint | undefined) {
    this.swap = swap
    this.stage = SwapStage.Withdraw
  }

  setWithdraw(withdraw: bigint) {
    this.withdraw = withdraw
    this.endTime = Date.now()
    this.stage = SwapStage.Completed
  }

  setError(error: Icrc1TransferError | ErrorSwap | string) {
    this.error = error
    this.endTime = Date.now()
  }

  toCandid(quote: Quote): SwapTransactionCandid {
    return {
      deposit: this.deposit ? [BigInt(this.deposit)] : [],
      end_time: this.endTime ? [BigInt(this.endTime)] : [],
      error: this.error ? [JSON.stringify(this.error)] : [],
      source_ledger: this.sourceLedger,
      stage: this.mapStageToCandid(this.stage),
      start_time: BigInt(this.startTime),
      swap: this.swap ? [BigInt(this.swap)] : [],
      target_ledger: this.targetLedger,
      transfer_id: this.transferId ? [BigInt(this.transferId)] : [],
      transfer_nfid_id: this.transferNFIDId
        ? [BigInt(this.transferNFIDId)]
        : [],
      withdraw: this.withdraw ? [BigInt(this.withdraw)] : [],
      uid: this.uid,
      target_amount: BigInt(this.quote),
      source_amount: BigInt(quote.getSourceAmount().toNumber()),
    }
  }

  public fromCandid(candid: SwapTransactionCandid): SwapTransaction {
    this.deposit = candid.deposit.length !== 0 ? candid.deposit[0] : undefined
    this.endTime = candid.end_time ? Number(candid.end_time) : undefined
    this.error =
      candid.error.length !== 0 ? JSON.parse(candid.error[0]) : undefined
    this.swap = candid.swap.length !== 0 ? candid.swap[0] : undefined
    this.startTime = Number(candid.start_time)
    this.withdraw =
      candid.withdraw.length !== 0 ? candid.withdraw[0] : undefined
    this.transferId =
      candid.transfer_id.length !== 0 ? candid.transfer_id[0] : undefined
    this.transferNFIDId =
      candid.transfer_nfid_id.length !== 0
        ? candid.transfer_nfid_id[0]
        : undefined
    this.stage = this.mapStageCandidateToStage(candid.stage)
    return this
  }
  private mapStageCandidateToStage(stage: SwapStageCandid): SwapStage {
    if (hasOwnProperty(stage, "TransferNFID")) return SwapStage.TransferNFID
    if (hasOwnProperty(stage, "TransferSwap")) return SwapStage.TransferSwap
    if (hasOwnProperty(stage, "Deposit")) return SwapStage.Deposit
    if (hasOwnProperty(stage, "Swap")) return SwapStage.Swap
    if (hasOwnProperty(stage, "Withdraw")) return SwapStage.Withdraw
    if (hasOwnProperty(stage, "Completed")) return SwapStage.Completed
    throw new Error("Invalid stage")
  }

  private mapStageToCandid(stage: SwapStage): SwapStageCandid {
    switch (stage) {
      case SwapStage.TransferNFID:
        return { TransferNFID: null }
      case SwapStage.TransferSwap:
        return { TransferSwap: null }
      case SwapStage.Deposit:
        return { Deposit: null }
      case SwapStage.Swap:
        return { Swap: null }
      case SwapStage.Withdraw:
        return { Withdraw: null }
      case SwapStage.Completed:
        return { Completed: null }
    }
  }
}
