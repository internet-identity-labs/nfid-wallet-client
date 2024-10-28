import * as Agent from "@dfinity/agent"
import { idlFactory as SwapStorageIDL } from "src/integration/icpswap/idl/swap_trs_storage"
import {
  _SERVICE as SwapStorage,
  SwapTransaction as SwapTransactionCandid,
} from "src/integration/icpswap/idl/swap_trs_storage.d"
import { SwapTransactionImpl } from "src/integration/icpswap/impl/swap-transaction-impl"
import { SwapTransaction } from "src/integration/icpswap/swap-transaction"
import { actorBuilder } from "src/integration/icpswap/util/util"

import {actor, agentBaseConfig} from "@nfid/integration"
import { getUserIdData } from "packages/integration/src/lib/cache/cache"

export const SWAP_TX_CANISTER = "mfoln-bqaaa-aaaao-qeuqq-cai"

class SwapTransactionService {
  private storageActor: Agent.ActorSubclass<SwapStorage>

  constructor() {
    this.storageActor = actorBuilder<SwapStorage>(
      SWAP_TX_CANISTER, //TODO WIP .env, stage, prod, subnet(?)
      SwapStorageIDL,
      {
        agent: new Agent.HttpAgent({
          ...agentBaseConfig,
        }),
      },
    )
  }

  async storeTransaction(
    trs: SwapTransactionCandid,
  ) {
    this.storageActor = actor<SwapStorage>(
      SWAP_TX_CANISTER, //TODO WIP .env, stage, prod, subnet(?)
      SwapStorageIDL
    )
    await this.storageActor.store_transaction(trs)
    await Promise.resolve()
  }

  async getTransactions(): Promise<Array<SwapTransaction>> {
    const cache = await getUserIdData()
    return this.storageActor.get_transactions(cache.userId).then((trss) => {
      return trss.map((t) => {
        return new SwapTransactionImpl(
          t.target_ledger,
          t.source_ledger,
          Number(t.target_amount),
          t.source_amount,
        ).fromCandid(t)
      })
    })
  }
}

export const swapTransactionService = new SwapTransactionService()
