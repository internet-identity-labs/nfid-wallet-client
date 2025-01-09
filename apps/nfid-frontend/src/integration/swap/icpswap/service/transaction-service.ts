import * as Agent from "@dfinity/agent"
import { HttpAgent } from "@dfinity/agent"
import { idlFactory as SwapStorageIDL } from "src/integration/swap/icpswap/idl/swap_trs_storage"
import {
  _SERVICE as SwapStorage,
  SwapTransaction as SwapTransactionCandid,
} from "src/integration/swap/icpswap/idl/swap_trs_storage.d"
import { IcpSwapTransactionImpl } from "src/integration/swap/icpswap/impl/icp-swap-transaction-impl"
import { SwapTransaction } from "src/integration/swap/icpswap/swap-transaction"

import {
  actor,
  agentBaseConfig,
  authState,
  replaceActorIdentity,
} from "@nfid/integration"

import { SwapStage } from "../types/enums"

export const APPROXIMATE_SWAP_DURATION = 2 * 60 * 1000

export class SwapTransactionService {
  private storageActor: Agent.ActorSubclass<SwapStorage>

  constructor() {
    this.storageActor = actor<SwapStorage>(SWAP_TRS_STORAGE, SwapStorageIDL, {
      agent: new HttpAgent({ ...agentBaseConfig }),
    })
  }

  async storeTransaction(trs: SwapTransactionCandid) {
    let di = authState.get().delegationIdentity
    if (!di) {
      throw new Error("Delegation identity not set")
    }
    await replaceActorIdentity(this.storageActor, di)
    await this.storageActor.store_transaction(trs)
  }

  async getTransactions(): Promise<Array<SwapTransaction>> {
    const cache = authState.getUserIdData()
    return this.storageActor.get_transactions(cache.userId).then((trss) => {
      return trss.map((t) => {
        const transaction = new IcpSwapTransactionImpl(
          t.target_ledger,
          t.source_ledger,
          Number(t.target_amount),
          t.source_amount,
        ).fromCandid(t)

        transaction.setIsLoading(
          Date.now() - Number(t.start_time) <= APPROXIMATE_SWAP_DURATION &&
            transaction.getStage() !== SwapStage.Completed &&
            !transaction.getErrors().length,
        )

        return transaction
      })
    })
  }
}

export const swapTransactionService = new SwapTransactionService()
