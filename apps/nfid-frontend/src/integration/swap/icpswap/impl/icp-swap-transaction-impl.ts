import { UUID } from "node:crypto"

import { Icrc1TransferError } from "@dfinity/ledger-icp/dist/candid/ledger"

import { SwapTransaction } from "src/integration/swap/swap-transaction"
import { AbstractSwapTransaction } from "src/integration/swap/transaction/transaction-abstract"
import { SwapName, SwapStage } from "src/integration/swap/types/enums"

import { SwapTransaction as SwapTransactionCandid } from "../../transaction/idl/swap_trs_storage.d"
import { Error as ErrorSwap } from "../idl/SwapPool.d"

export class IcpSwapTransactionImpl extends AbstractSwapTransaction {
  private withdraw: bigint | undefined

  getProvider(): SwapName {
    return SwapName.ICPSwap
  }

  getSwap(): bigint | undefined {
    return this.swap
  }

  getWithdraw(): bigint | undefined {
    return this.withdraw
  }

  setNFIDTransferId(transferId: bigint) {
    this.transferNFIDId = transferId
    this.stage = SwapStage.Completed
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
      swap_provider: { IcpSwap: null },
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
}
