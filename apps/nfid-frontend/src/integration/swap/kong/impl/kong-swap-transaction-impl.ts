import { UUID } from "node:crypto"

import { SwapTransaction } from "src/integration/swap/swap-transaction"
import { SwapTransaction as SwapTransactionCandid } from "src/integration/swap/transaction/idl/swap_trs_storage.d"
import { AbstractSwapTransaction } from "src/integration/swap/transaction/transaction-abstract"
import { SwapName, SwapStage } from "src/integration/swap/types/enums"

export class KongSwapTransactionImpl extends AbstractSwapTransaction {
  getProvider(): SwapName {
    return SwapName.Kongswap
  }

  setTransferId(transferId: bigint) {
    this.transferId = transferId
    this.stage = SwapStage.Swap
  }

  setSwap(swap: bigint | undefined) {
    this.swap = swap
    this.stage = SwapStage.TransferNFID
  }

  toCandid(): SwapTransactionCandid {
    return {
      deposit: [],
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
      transfer_id: [],
      transfer_nfid_id: this.transferNFIDId
        ? [BigInt(this.transferNFIDId)]
        : [],
      withdraw: [],
      uid: this.uid,
      target_amount: BigInt(this.quote),
      source_amount: BigInt(this.sourceAmount),
      swap_provider: { Kong: null },
    }
  }

  public fromCandid(candid: SwapTransactionCandid): SwapTransaction {
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
    this.transferNFIDId =
      candid.transfer_nfid_id.length !== 0
        ? candid.transfer_nfid_id[0]
        : undefined
    this.stage = this.mapStageCandidateToStage(candid.stage)
    return this
  }

  getDeposit(): bigint | undefined {
    throw new Error("Method not implemented.")
  }

  getWithdraw(): bigint | undefined {
    throw new Error("Method not implemented.")
  }

  setWithdraw(_withdraw: bigint): void {
    throw new Error("Method not implemented.")
  }
}
