// A global singleton for our internet computer actors.
import * as Agent from "@dfinity/agent"
import { InterfaceFactory } from "@dfinity/candid/lib/cjs/idl"

import { authState } from "frontend/integration/internet-identity"

import { _SERVICE as IdentityManager } from "./_ic_api/identity_manager.did.d"
import { idlFactory as imIDL } from "./_ic_api/identity_manager_idl"
import { _SERVICE as ImAddition } from "./_ic_api/im_addition.did.d"
import { idlFactory as imaIDL } from "./_ic_api/im_addition_idl"
import { idlFactory as iiIDL } from "./_ic_api/internet_identity_idl"
import { _SERVICE as InternetIdentity } from "./_ic_api/internet_identity_types.d"
import { _SERVICE as PubSub } from "./_ic_api/pub_sub_channel.did.d"
import { idlFactory as pubsubIDL } from "./_ic_api/pub_sub_channel_idl"
import { _SERVICE as Verifier } from "./_ic_api/verifier.did.d"
import { idlFactory as verifierIDL } from "./_ic_api/verifier_idl"

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
declare const VERIFIER_CANISTER_ID: string

const canisterConfig = [
  ["Internet Identity", INTERNET_IDENTITY_CANISTER_ID],
  ["Identity Manager", IDENTITY_MANAGER_CANISTER_ID],
  ["Pubsub", PUB_SUB_CHANNEL_CANISTER_ID],
  ["IM Addition", IM_ADDITION_CANISTER_ID],
  ["Verifier", VERIFIER_CANISTER_ID],
]

export const accessList = canisterConfig.map((x) => x[1])

// NOTE: Might be nice to have the canister named in this exception
for (const [label, canister] of canisterConfig) {
  if (!canister)
    throw new Error(`Missing canister id for "${label}", please check envars.`)
}

export const ic = {
  host: IC_HOST || "https://ic0.app",
  isLocal: II_ENV === "development",
}

////////////
// Agent //
//////////

// We share the same agent across all actors, and replace the identity when identity connection events occur.

export const agent = new Agent.HttpAgent({ host: ic.host })

/**
 * When user connects an identity, we update our agent.
 */
export function replaceIdentity(identity: Agent.Identity) {
  agent.replaceIdentity(identity)
  agent.getPrincipal().then((principal) => {
    console.debug("replaceIdentity", { principalId: principal.toText() })
  })
}

/**
 * When user disconnects an identity, we update our agent.
 */
export function invalidateIdentity() {
  authState.reset()
  agent.invalidateIdentity()
}

// When working locally (or !mainnet) we need to retrieve the root key of the replica.
if (ic.isLocal) agent.fetchRootKey()

/**
 * Create an actor.
 */
function actor<T>(
  canisterId: string,
  factory: InterfaceFactory,
  config?: Agent.ActorConfig,
): Agent.ActorSubclass<T> {
  return Agent.Actor.createActor(factory, { canisterId, agent, ...config })
}

// All of the actor definitions needed in our app should go here.

export const pubsub = actor<PubSub>(PUB_SUB_CHANNEL_CANISTER_ID, pubsubIDL)
export const ii = actor<InternetIdentity>(INTERNET_IDENTITY_CANISTER_ID, iiIDL)
export const im = actor<IdentityManager>(IDENTITY_MANAGER_CANISTER_ID, imIDL)
export const ima = actor<ImAddition>(IM_ADDITION_CANISTER_ID, imaIDL)
export const verifier = actor<Verifier>(VERIFIER_CANISTER_ID, verifierIDL)

export type { InternetIdentity, IdentityManager, ImAddition, Verifier }
