import { Icrc1TransferError } from "@dfinity/ledger-icp/dist/candid/ledger"
import { UUID } from "node:crypto"
import {
  SwapError,
  SwapTransaction,
} from "src/integration/icpswap/swap-transaction"
import { SwapStage } from "src/integration/icpswap/types/enums"
import { v4 as uuidv4 } from "uuid"

import { hasOwnProperty } from "@nfid/integration"

import { Error as ErrorSwap } from "./../idl/SwapPool.d"
import {
  SwapStage as SwapStageCandid,
  SwapTransaction as SwapTransactionCandid,
} from "./../idl/swap_trs_storage.d"

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
  private errors: Array<SwapError>
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
    this.stage = SwapStage.TransferSwap
    this.targetLedger = targetLedger
    this.sourceLedger = sourceLedger
    this.uid = this.generateUUID()
    this.quote = quote
    this.sourceAmount = amount
    this.errors = []
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

  getErrors(): Array<SwapError> {
    return this.errors
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
    this.stage = SwapStage.Completed
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
    this.stage = SwapStage.TransferNFID
  }

  setCompleted() {
    this.endTime = Date.now()
    this.stage = SwapStage.Completed
  }

  setError(error: Icrc1TransferError | ErrorSwap | string) {
    const swapError = {
      time: BigInt(Date.now()),
      message: error.toString(),
    }
    this.errors.push(swapError)
  }

  toCandid(): SwapTransactionCandid {
    return {
      deposit: this.deposit ? [BigInt(this.deposit)] : [],
      end_time: this.endTime ? [BigInt(this.endTime)] : [],
      errors: this.errors.map((error) => {
        return {
          message: JSON.stringify(error),
          time: error.time,
        }
      }),
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
      source_amount: BigInt(this.sourceAmount),
    }
  }

  public fromCandid(candid: SwapTransactionCandid): SwapTransaction {
    this.deposit = candid.deposit.length !== 0 ? candid.deposit[0] : undefined
    this.uid = candid.uid as UUID
    this.endTime = candid.end_time ? Number(candid.end_time) : undefined
    this.errors = candid.errors.map((error) => {
      return {
        time: error.time,
        message: error.message,
      }
    })
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

  private generateUUID(): UUID {
    if (
      typeof globalThis.crypto !== "undefined" &&
      typeof globalThis.crypto.randomUUID === "function"
    ) {
      return globalThis.crypto.randomUUID()
    } else {
      return uuidv4() as UUID
    }
  }
}
