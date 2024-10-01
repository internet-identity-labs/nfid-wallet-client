import {Icrc1TransferError} from "@dfinity/ledger-icp/dist/candid/ledger"
import {SwapTransaction} from "src/integration/icpswap/swap-transaction"
import {SwapStage} from "src/integration/icpswap/types/enums"

import {Error as ErrorSwap} from "./../idl/SwapPool.d"
import {SwapStage as SwapStageCandid, SwapTransaction as SwapTransactionCandid} from "./../idl/swap_trs_storage.d"
import {Quote} from "src/integration/icpswap/quote";
import {hasOwnProperty} from "@nfid/integration";

export class SwapTransactionImpl implements SwapTransaction {
  private startTime: number
  private transferId: bigint | undefined
  private transferNFIDId: bigint | undefined
  private deposit: bigint | undefined
  private swap: bigint | undefined
  private withdraw: bigint | undefined
  private endTime: number | undefined
  private error: ErrorSwap | Icrc1TransferError | undefined | string
  private stage: SwapStage
  private readonly targetLedger: string
  private readonly sourceLedger: string

  constructor(targetLedger: string, sourceLedger: string) {
    this.startTime = Date.now()
    this.stage = SwapStage.Transfer
    this.targetLedger = targetLedger
    this.sourceLedger = sourceLedger
  }

  getStage(): SwapStage {
    return this.stage
  }

  public setTransferId(transferId: bigint) {
    this.transferId = transferId
    if (this.transferNFIDId) this.stage = SwapStage.Deposit
  }

  public setNFIDTransferId(transferId: bigint) {
    this.transferNFIDId = transferId
    if (this.transferId) this.stage = SwapStage.Deposit
  }

  public setDeposit(deposit: bigint) {
    this.deposit = deposit
    this.stage = SwapStage.Swap
  }

  public setSwap(swap: bigint) {
    this.swap = swap
    this.stage = SwapStage.Withdraw
  }

  public setWithdraw(withdraw: bigint) {
    this.withdraw = withdraw
    this.endTime = Date.now()
    this.stage = SwapStage.Completed
  }

  public setError(error: Icrc1TransferError | ErrorSwap | string) {
    this.error = error
    this.endTime = Date.now()
    this.stage = SwapStage.Error
  }

  public toCandid(quote: Quote): SwapTransactionCandid {
    return {
      deposit: this.deposit || BigInt(0),
      end_time: this.endTime ? BigInt(this.endTime) : BigInt(0),
      error: this.error ? [JSON.stringify(this.error)] : [],
      source_amount: BigInt(quote.getSourceAmount().toNumber()),
      source_ledger: this.sourceLedger,
      stage: this.mapStageToCandid(this.stage),
      start_time: BigInt(this.startTime),
      swap: this.swap || BigInt(0),
      target_amount: BigInt(quote.getTargetAmount().toNumber()),
      target_ledger: this.targetLedger,
      transfer_id: this.transferId || BigInt(0),
      transfer_nfid_id: this.transferNFIDId || BigInt(0),
      withdraw: this.withdraw || BigInt(0),
    }
  }

  public fromCandid(candid: SwapTransactionCandid): SwapTransaction {
    this.deposit = candid.deposit
    this.endTime = candid.end_time ? Number(candid.end_time) : undefined
    this.error = candid.error.length !== 0 ? JSON.parse(candid.error[0]) : undefined
    this.swap = candid.swap
    this.startTime = Number(candid.start_time)
    this.withdraw = candid.withdraw
    this.transferId = candid.transfer_id
    this.transferNFIDId = candid.transfer_nfid_id
    this.stage = this.mapStageCandidateToStage(candid.stage)
    return this
  }

  mapStageCandidateToStage(stage: SwapStageCandid): SwapStage {
    if (hasOwnProperty(stage, "Transfer")) return SwapStage.Transfer
    if (hasOwnProperty(stage, "Deposit")) return SwapStage.Deposit
    if (hasOwnProperty(stage, "Swap")) return SwapStage.Swap
    if (hasOwnProperty(stage, "Withdraw")) return SwapStage.Withdraw
    if (hasOwnProperty(stage, "Completed")) return SwapStage.Completed
    if (hasOwnProperty(stage, "Error")) return SwapStage.Error
    throw new Error("Invalid stage")
  }

  private mapStageToCandid(stage: SwapStage): SwapStageCandid {
    switch (stage) {
      case SwapStage.Transfer:
        return {Transfer: null}
      case SwapStage.Deposit:
        return {Deposit: null}
      case SwapStage.Swap:
        return {Swap: null}
      case SwapStage.Withdraw:
        return {Withdraw: null}
      case SwapStage.Completed:
        return {Completed: null}
      case SwapStage.Error:
        return {Error: null}
    }
  }

}
