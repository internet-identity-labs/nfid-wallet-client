// A global singleton for our internet computer actors.
import * as Agent from "@dfinity/agent"
import { InterfaceFactory } from "@dfinity/candid/lib/cjs/idl"

import { _SERVICE as IdentityManager } from "./idl/identity_manager.did"
import { idlFactory as imIDL } from "./idl/identity_manager_idl"
import { _SERVICE as ImAddition } from "./idl/im_addition.did"
import { idlFactory as imaIDL } from "./idl/im_addition_idl"
import { idlFactory as iiIDL } from "./idl/internet_identity_idl"
import { _SERVICE as InternetIdentity } from "./idl/internet_identity_types"
import { _SERVICE as PubSub } from "./idl/pub_sub_channel.did"
import { idlFactory as pubsubIDL } from "./idl/pub_sub_channel_idl"

/////////////
// Config //
///////////

// Envars
declare const II_ENV: string
declare const IC_HOST: string
declare const INTERNET_IDENTITY_CANISTER_ID: string
declare const IDENTITY_MANAGER_CANISTER_ID: string
declare const PUB_SUB_CHANNEL_CANISTER_ID: string
declare const IM_ADDITION_CANISTER_ID: string

export const accessList = [
  INTERNET_IDENTITY_CANISTER_ID,
  IDENTITY_MANAGER_CANISTER_ID,
  PUB_SUB_CHANNEL_CANISTER_ID,
  IM_ADDITION_CANISTER_ID,
]

for (const canister of accessList) {
  if (!canister) throw new Error("Missing canister id, please check envars.")
}

export const ic = {
  host: IC_HOST || "https://ic0.app",
  isLocal: II_ENV === "development",
}

////////////
// Agent //
//////////

// We share the same agent across all actors, and replace the identity when connection events occur.

// When user connects an identity, we update our agent.
export function replaceIdentity(identity: Agent.Identity) {
  agent.replaceIdentity(identity)
}

// When user disconnects an identity, we update our agent.
export function invalidateIdentity() {
  agent.invalidateIdentity()
}

// The same agent powers all actors.
export const agent = new Agent.HttpAgent({ host: ic.host })

// When working locally (or !mainnet) we need to retrieve the root key of the replica.
if (ic.isLocal) agent.fetchRootKey()

/////////////
// Actors //
///////////

// The actors make up the bulk of the public API of this module. We can import these to message ic canisters through this app. We shouldn't need any actors other than those defined here.

export const pubsub = actor<PubSub>(PUB_SUB_CHANNEL_CANISTER_ID, pubsubIDL)
export const ii = actor<InternetIdentity>(INTERNET_IDENTITY_CANISTER_ID, iiIDL)
export const im = actor<IdentityManager>(IDENTITY_MANAGER_CANISTER_ID, imIDL)
export const ima = actor<ImAddition>(IM_ADDITION_CANISTER_ID, imaIDL)

// We reexport our actor type definitions for convenient import.
export type { InternetIdentity, IdentityManager, ImAddition, PubSub }

//////////
// Lib //
////////

// Create an actor.
export function actor<T>(
  canisterId: string,
  factory: InterfaceFactory,
  config?: Agent.ActorConfig,
): Agent.ActorSubclass<T> {
  return Agent.Actor.createActor(factory, { canisterId, agent, ...config })
}
