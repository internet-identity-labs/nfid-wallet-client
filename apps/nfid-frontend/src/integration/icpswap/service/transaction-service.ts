import { SignIdentity } from "@dfinity/agent"
import * as Agent from "@dfinity/agent"
import { idlFactory as SwapStorageIDL } from "src/integration/icpswap/idl/swap_trs_storage"
import {
  _SERVICE as SwapStorage,
  SwapTransaction as SwapTransactionCandid,
} from "src/integration/icpswap/idl/swap_trs_storage.d"
import { SwapTransactionImpl } from "src/integration/icpswap/impl/swap-transaction-impl"
import { SwapTransaction } from "src/integration/icpswap/swap-transaction"

import { actor, replaceActorIdentity } from "@nfid/integration"

export const SWAP_TX_CANISTER = "qt7cv-eyaaa-aaaap-qapga-cai"
export const UNKNOWN_CANISTER = "moe7a-tiaaa-aaaag-qclfq-cai"

class SwapTransactionService {
  private readonly storageActor: Agent.ActorSubclass<SwapStorage>

  constructor() {
    this.storageActor = actor<SwapStorage>(
      SWAP_TX_CANISTER, //TODO WIP .env, stage, prod, subnet(?)
      SwapStorageIDL,
    )
  }

  async storeTransaction(
    trs: SwapTransactionCandid,
    delegationIdentity: SignIdentity,
  ) {
    await replaceActorIdentity(this.storageActor, delegationIdentity)
    await this.storageActor.store_transaction(trs)
  }

  async getTransactions(caller: string): Promise<Array<SwapTransaction>> {
    return this.storageActor.get_transactions(caller).then((trss) => {
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
