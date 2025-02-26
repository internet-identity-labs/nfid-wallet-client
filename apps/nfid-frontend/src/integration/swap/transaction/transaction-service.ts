import * as Agent from "@dfinity/agent"
import { HttpAgent } from "@dfinity/agent"
import { IcpSwapTransactionImpl } from "src/integration/swap/icpswap/impl/icp-swap-transaction-impl"
import { KongSwapTransactionImpl } from "src/integration/swap/kong/impl/kong-swap-transaction-impl"
import { SwapTransaction } from "src/integration/swap/swap-transaction"
import { idlFactory as SwapStorageIDL } from "src/integration/swap/transaction/idl/swap_trs_storage"
import {
  _SERVICE as SwapStorage,
  SwapTransaction as SwapTransactionCandid,
} from "src/integration/swap/transaction/idl/swap_trs_storage.d"

import {
  actor,
  agentBaseConfig,
  authState,
  hasOwnProperty,
  replaceActorIdentity,
} from "@nfid/integration"

import { swapXTweetService } from "../service/swap-x-tweet-service"

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

    if ("Completed" in trs.stage && trs.errors.length === 0) {
      // Intentionally not awaited.
      swapXTweetService
        .tweet(di.getPrincipal().toString(), trs.uid)
        .catch((x) => console.debug(x))
    }
  }

  async getTransactions(): Promise<Array<SwapTransaction>> {
    const cache = authState.getUserIdData()
    return this.storageActor.get_transactions(cache.userId).then((trss) => {
      return trss.map((t) => {
        const transaction = hasOwnProperty(t.swap_provider, "Kong")
          ? new KongSwapTransactionImpl(
              t.target_ledger,
              t.source_ledger,
              Number(t.target_amount),
              t.source_amount,
            ).fromCandid(t)
          : new IcpSwapTransactionImpl(
              t.target_ledger,
              t.source_ledger,
              Number(t.target_amount),
              t.source_amount,
            ).fromCandid(t)

        transaction.setIsLoading(
          Date.now() - Number(t.start_time) <= APPROXIMATE_SWAP_DURATION,
        )

        return transaction
      })
    })
  }
}

export const swapTransactionService = new SwapTransactionService()
