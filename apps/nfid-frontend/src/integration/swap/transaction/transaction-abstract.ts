import { UUID } from "node:crypto"

import { v4 as uuidv4 } from "uuid"

import { hasOwnProperty } from "@nfid/integration"

import {
  SwapError,
  SwapTransaction,
} from "src/integration/swap/swap-transaction"
import {
  SwapStage as SwapStageCandid,
  SwapTransaction as SwapTransactionCandid,
} from "src/integration/swap/transaction/idl/swap_trs_storage.d"
import { SwapName, SwapStage } from "src/integration/swap/types/enums"

export abstract class AbstractSwapTransaction implements SwapTransaction {
  protected uid: UUID
  protected startTime: number
  protected sourceAmount: bigint
  protected transferNFIDId: bigint | undefined
  protected quote: number
  protected swap: bigint | undefined
  protected endTime: number | undefined
  protected errors: Array<SwapError>
  protected stage: SwapStage
  protected isLoading: boolean
  protected transferId: bigint | undefined
  protected deposit: bigint | undefined
  protected readonly targetLedger: string
  protected readonly sourceLedger: string
  protected readonly swapProvider: SwapName

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
    this.isLoading = false
    this.swapProvider = this.getProvider()
  }

  abstract getProvider(): SwapName
  abstract toCandid(): SwapTransactionCandid
  abstract fromCandid(candid: SwapTransactionCandid): SwapTransaction
  abstract getWithdraw(): bigint | undefined
  abstract setWithdraw(withdraw: bigint): void
  abstract setSwap(swap: bigint | undefined): void
  getTransferId(): bigint | undefined {
    return this.transferId
  }

  getDeposit(): bigint | undefined {
    return this.deposit
  }

  setTransferId(transferId: bigint) {
    this.transferId = transferId
    this.stage = SwapStage.Deposit
  }

  setDeposit(deposit: bigint) {
    this.deposit = deposit
    this.stage = SwapStage.Swap
  }

  getIsLoading(): boolean {
    return this.isLoading
  }

  setIsLoading(value: boolean): void {
    this.isLoading = value
  }

  getStartTime(): number {
    return this.startTime
  }

  getTransferNFIDId(): bigint | undefined {
    return this.transferNFIDId
  }

  getSwap(): bigint | undefined {
    return this.swap
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

  getSwapName(): SwapName {
    return this.swapProvider
  }

  setNFIDTransferId(transferId: bigint) {
    this.transferNFIDId = transferId
    this.stage = SwapStage.Completed
  }

  setCompleted() {
    this.endTime = Date.now()
    this.stage = SwapStage.Completed
  }

  setError(error: string) {
    const swapError = {
      time: BigInt(Date.now()),
      message: error.toString(),
    }
    this.errors.push(swapError)
  }

  protected mapStageCandidateToStage(stage: SwapStageCandid): SwapStage {
    if (hasOwnProperty(stage, "TransferNFID")) return SwapStage.TransferNFID
    if (hasOwnProperty(stage, "TransferSwap")) return SwapStage.TransferSwap
    if (hasOwnProperty(stage, "Deposit")) return SwapStage.Deposit
    if (hasOwnProperty(stage, "Swap")) return SwapStage.Swap
    if (hasOwnProperty(stage, "Withdraw")) return SwapStage.Withdraw
    if (hasOwnProperty(stage, "Completed")) return SwapStage.Completed
    throw new Error("Invalid stage")
  }

  protected mapStageToCandid(stage: SwapStage): SwapStageCandid {
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

  protected generateUUID(): UUID {
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
