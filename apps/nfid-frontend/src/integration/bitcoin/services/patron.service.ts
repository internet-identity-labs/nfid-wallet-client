import { HttpAgent, SignIdentity } from "@dfinity/agent"

import { actor, agentBaseConfig } from "@nfid/integration"

import { idlFactory as patronIDL } from "../idl/patron"
import { _SERVICE as Patron } from "../idl/patron.d"

export class PatronService {

  public async askToPayFor(identity: SignIdentity): Promise<void> {
    const patronActor = actor<Patron>(PATRON_CANISTER_ID, patronIDL, {
      agent: HttpAgent.createSync({ ...agentBaseConfig, identity }),
    })

    await patronActor.allow_signing([])
  }
}

export const patronService = new PatronService()
