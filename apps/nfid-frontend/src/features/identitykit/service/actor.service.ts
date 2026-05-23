import { Actor, type ActorSubclass, type Agent } from "@icp-sdk/core/agent"
import { IDL } from "@icp-sdk/core/candid"

type InterfaceFactory = IDL.InterfaceFactory

class ActorService {
  public getActor<T>(
    canisterId: string,
    factory: InterfaceFactory,
    agent?: Agent,
  ): ActorSubclass<T> {
    return Actor.createActor(factory, { canisterId, agent })
  }
}

export const actorService = new ActorService()
