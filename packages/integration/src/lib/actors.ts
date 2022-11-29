// A global singleton for our internet computer actors.
import * as Agent from "@dfinity/agent"
import { ActorMethod, HttpAgent, Identity, SignIdentity } from "@dfinity/agent"
import { InterfaceFactory } from "@dfinity/candid/lib/cjs/idl"

import { idlFactory as cyclesMinterIDL } from "./_ic_api/cycles_minter"
import { _SERVICE as CyclesMinter } from "./_ic_api/cycles_minter.d"
import { idlFactory as imIDL } from "./_ic_api/identity_manager"
import { _SERVICE as IdentityManager } from "./_ic_api/identity_manager.d"
import { idlFactory as iiIDL } from "./_ic_api/internet_identity"
import { _SERVICE as InternetIdentity } from "./_ic_api/internet_identity.d"
import { idlFactory as ledgerIDL } from "./_ic_api/ledger"
import { _SERVICE as Ledger } from "./_ic_api/ledger.d"
import { idlFactory as pubsubIDL } from "./_ic_api/pub_sub_channel"
import { _SERVICE as PubSub } from "./_ic_api/pub_sub_channel.d"
import { idlFactory as vaultIDL } from "./_ic_api/vault"
import { _SERVICE as Vault } from "./_ic_api/vault.d"
import { idlFactory as verifierIDL } from "./_ic_api/verifier"
import { _SERVICE as Verifier } from "./_ic_api/verifier.d"
import { agent } from "./agent"

/////////////
// Config //
///////////

// Envars
declare const INTERNET_IDENTITY_CANISTER_ID: string
declare const IDENTITY_MANAGER_CANISTER_ID: string
declare const PUB_SUB_CHANNEL_CANISTER_ID: string
declare const VERIFIER_CANISTER_ID: string
declare const LEDGER_CANISTER_ID: string
declare const CYCLES_MINTER_CANISTER_ID: string
declare const VAULT_CANISTER_ID: string

const canisterConfig = [
  ["Internet Identity", INTERNET_IDENTITY_CANISTER_ID],
  ["Identity Manager", IDENTITY_MANAGER_CANISTER_ID],
  ["Pubsub", PUB_SUB_CHANNEL_CANISTER_ID],
  ["Verifier", VERIFIER_CANISTER_ID],
  ["Ledger", LEDGER_CANISTER_ID],
  ["CyclesMinter", CYCLES_MINTER_CANISTER_ID],
  ["Vault", VAULT_CANISTER_ID],
]

export const accessList = canisterConfig.map((x) => x[1])

// NOTE: Might be nice to have the canister named in this exception
for (const [label, canister] of canisterConfig) {
  if (!canister)
    throw new Error(`Missing canister id for "${label}", please check envars.`)
}

/**
 * Create an actor.
 */
export function actor<T>(
  canisterId: string,
  factory: InterfaceFactory,
  config?: Partial<Agent.ActorConfig>,
): Agent.ActorSubclass<T> {
  return Agent.Actor.createActor(factory, { canisterId, agent, ...config })
}

export function ledgerWithIdentity(identity: SignIdentity) {
  return actor<Ledger>(LEDGER_CANISTER_ID, ledgerIDL, {
    // TODO WALLET CODE REVIEW MAKE CONFIGURABLYAT
    agent: new HttpAgent({ identity, host: "https://ic0.app" }),
  })
}

export async function initActor(
  identity: Identity,
  canisterId: string,
  factory: InterfaceFactory,
): Promise<Record<string, ActorMethod>> {
  return actor(canisterId, factory, {
    agent: new HttpAgent({ host: "https://ic0.app", identity }),
  })
}
// All of the actor definitions needed in our app should go here.

export const pubsub = actor<PubSub>(PUB_SUB_CHANNEL_CANISTER_ID, pubsubIDL)
export const ii = actor<InternetIdentity>(INTERNET_IDENTITY_CANISTER_ID, iiIDL)
export const im = actor<IdentityManager>(IDENTITY_MANAGER_CANISTER_ID, imIDL)
export const verifier = actor<Verifier>(VERIFIER_CANISTER_ID, verifierIDL)
export const ledger = actor<Ledger>(LEDGER_CANISTER_ID, ledgerIDL)
export const vault = actor<Vault>(VAULT_CANISTER_ID, vaultIDL)
export const cyclesMinter = actor<CyclesMinter>(
  CYCLES_MINTER_CANISTER_ID,
  cyclesMinterIDL,
)
