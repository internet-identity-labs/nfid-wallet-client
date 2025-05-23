import { HttpAgent, SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import { authStorage } from "packages/integration/src/lib/authentication/storage"

import { actor, agentBaseConfig } from "@nfid/integration"

import { Account, PaymentType } from "../idl/chain-fusion-signer.d"
import { idlFactory as patronIDL } from "../idl/patron"
import { _SERVICE as Patron } from "../idl/patron.d"

export class PatronService {
  public async askToPayFor(identity: SignIdentity): Promise<void> {
    const key = `patron`
    const cachedValue = await authStorage.get(key)

    if (cachedValue != null) {
      return
    }

    const patronActor = actor<Patron>(PATRON_CANISTER_ID, patronIDL, {
      agent: HttpAgent.createSync({ ...agentBaseConfig, identity }),
    })

    await patronActor.allow_signing([])
    await authStorage.set(key, "v1")
  }

  public getPaymentType(): PaymentType {
    const patronAccount: Account = {
      owner: Principal.fromText(PATRON_CANISTER_ID),
      subaccount: [],
    }

    const payment: PaymentType = { PatronPaysIcrc2Cycles: patronAccount }
    return payment
  }
}

export const patronService = new PatronService()
