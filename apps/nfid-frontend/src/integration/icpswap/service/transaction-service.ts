import {actor, replaceActorIdentity} from "@nfid/integration";
import {idlFactory as SwapStorageIDL} from "src/integration/icpswap/idl/swap_trs_storage";
import {_SERVICE as SwapStorage, SwapTransaction as SwapTransactionCandid} from "src/integration/icpswap/idl/swap_trs_storage.d";
import {SwapTransaction} from "src/integration/icpswap/swap-transaction";
import {SignIdentity} from "@dfinity/agent";
import * as Agent from "@dfinity/agent";
import {SwapTransactionImpl} from "src/integration/icpswap/impl/swap-transaction-impl";

class SwapTransactionService {
  private readonly storageActor: Agent.ActorSubclass<SwapStorage>

  constructor() {
    this.storageActor = actor<SwapStorage>(
      "qt7cv-eyaaa-aaaap-qapga-cai", //TODO WIP .env, stage, prod, subnet(?)
      SwapStorageIDL,
    )
  }

  async storeTransaction(trs: SwapTransactionCandid, delegationIdentity: SignIdentity) {
    await replaceActorIdentity(this.storageActor, delegationIdentity)
    await this.storageActor.store_transaction(trs)
  }

  async getTransactions(caller: string): Promise<Array<SwapTransaction>> {
    return this.storageActor.get_transactions(caller)
      .then((trss) => {
        return trss.map((t) => {
          return new SwapTransactionImpl(t.target_ledger, t.source_ledger).fromCandid(t)
        })
      })
  }
}

export const swapTransactionService = new SwapTransactionService()
