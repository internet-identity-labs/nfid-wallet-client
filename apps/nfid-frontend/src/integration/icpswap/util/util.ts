import * as Agent from "@dfinity/agent"
import { InterfaceFactory } from "@dfinity/candid/lib/cjs/idl"
import { Principal } from "@dfinity/principal"

import {agent} from "@nfid/integration"

export function actorBuilder<T>(
  canisterId: string | Principal,
  factory: InterfaceFactory,
  config?: Partial<Agent.ActorConfig>,
): Agent.ActorSubclass<T> {
  return Agent.Actor.createActor(factory, {
    canisterId, agent, ...config
  })
}
