import { Icrc1TransferError } from "@dfinity/ledger-icp/dist/candid/ledger"
import { SwapTransaction } from "src/integration/icpswap/swap-transaction"
import { SwapStage } from "src/integration/icpswap/types/enums"

import { Error as ErrorSwap } from "./../idl/SwapPool.d"

export class SwapTransactionImpl implements SwapTransaction {
  private readonly startTime: number
  private transferId: bigint | undefined
  private transferNFIDId: bigint | undefined
  private deposit: bigint | undefined
  private swap: bigint | undefined
  private withdraw: bigint | undefined
  private endTime: number | undefined
  private error: ErrorSwap | Icrc1TransferError | undefined
  private stage: SwapStage
  private callback: ((value: SwapStage) => void) | undefined

  constructor() {
    this.startTime = Date.now()
    this.stage = SwapStage.Transfer
  }

  getStage(): SwapStage {
    return this.stage
  }

  private changeState(stage: SwapStage): void {
    if (this.callback) {
      this.callback(stage)
    }
    this.stage = stage
  }

  setCallback(cb: (stage: SwapStage) => void) {
    this.callback = cb
  }

  public setTransferId(transferId: bigint) {
    this.transferId = transferId
    if (this.transferNFIDId) this.changeState(SwapStage.Deposit)
  }

  public setNFIDTransferId(transferId: bigint) {
    this.transferNFIDId = transferId
    if (this.transferNFIDId) this.changeState(SwapStage.Deposit)
  }

  public setDeposit(deposit: bigint) {
    this.deposit = deposit
    if (this.deposit) this.changeState(SwapStage.Swap)
  }

  public setSwap(swap: bigint) {
    this.swap = swap
    if (this.swap) this.changeState(SwapStage.Withdraw)
  }

  public setWithdraw(withdraw: bigint) {
    this.withdraw = withdraw
    this.endTime = Date.now()
    if (this.withdraw) this.changeState(SwapStage.Completed)
  }

  public setError(error: Icrc1TransferError | ErrorSwap) {
    this.error = error
    this.endTime = Date.now()
    if (this.error) this.changeState(SwapStage.Error)
  }
}
