// A global singleton for our internet computer actors.
import * as Agent from "@dfinity/agent"
import {
  ActorMethod,
  HttpAgent,
  Identity, SignIdentity,
  SubmitResponse,
} from "@dfinity/agent"
import { InterfaceFactory } from "@dfinity/candid/lib/cjs/idl"
import { DelegationIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"

import { authState } from "frontend/integration/internet-identity"

import { _SERVICE as CyclesMinter } from "./_ic_api/cycles_minter.did"
import { idlFactory as cyclesMinterIDL } from "./_ic_api/cycles_minter_idl"
import { _SERVICE as IdentityManager } from "./_ic_api/identity_manager.did.d"
import { idlFactory as imIDL } from "./_ic_api/identity_manager_idl"
import { idlFactory as iiIDL } from "./_ic_api/internet_identity_idl"
import { _SERVICE as InternetIdentity } from "./_ic_api/internet_identity_types.d"
import { _SERVICE as Ledger } from "./_ic_api/ledger.did.d"
import { idlFactory as ledgerIDL } from "./_ic_api/ledger_idl"
import { _SERVICE as PubSub } from "./_ic_api/pub_sub_channel.did.d"
import { idlFactory as pubsubIDL } from "./_ic_api/pub_sub_channel_idl"
import { _SERVICE as Verifier } from "./_ic_api/verifier.did.d"
import { idlFactory as verifierIDL } from "./_ic_api/verifier_idl"

/////////////
// Config //
///////////

// Envars
declare const II_ENV: string
declare const IS_DEV: string
declare const IC_HOST: string
declare const INTERNET_IDENTITY_CANISTER_ID: string
declare const IDENTITY_MANAGER_CANISTER_ID: string
declare const PUB_SUB_CHANNEL_CANISTER_ID: string
declare const VERIFIER_CANISTER_ID: string
declare const LEDGER_CANISTER_ID: string
declare const CYCLES_MINTER_CANISTER_ID: string

const canisterConfig = [
  ["Internet Identity", INTERNET_IDENTITY_CANISTER_ID],
  ["Identity Manager", IDENTITY_MANAGER_CANISTER_ID],
  ["Pubsub", PUB_SUB_CHANNEL_CANISTER_ID],
  ["Verifier", VERIFIER_CANISTER_ID],
  ["Ledger", LEDGER_CANISTER_ID],
  ["CyclesMinter", CYCLES_MINTER_CANISTER_ID],
]

export const accessList = canisterConfig.map((x) => x[1])

// NOTE: Might be nice to have the canister named in this exception
for (const [label, canister] of canisterConfig) {
  if (!canister)
    throw new Error(`Missing canister id for "${label}", please check envars.`)
}

export const ic = {
  host: IC_HOST || "https://ic0.app",
  // NOTE: not sure if this is the right envar for islocal
  isLocal: II_ENV === "development",
  isDev: IS_DEV,
}

////////////
// Agent //
//////////

/** Agent which retries all failed calls in order to mitigate "certified state unavailable" and "service overload" 5XX errors. */
class AgentWithRetry extends Agent.HttpAgent {
  RETRY_LIMIT = 5
  call(
    canisterId: Principal | string,
    options: {
      methodName: string
      arg: ArrayBuffer
      effectiveCanisterId?: Principal | string
    },
    identity?: Identity | Promise<Identity>,
    attempt: number = 1,
  ) {
    try {
      return super.call(canisterId, options, identity)
    } catch (e: unknown) {
      if (attempt < this.RETRY_LIMIT) {
        console.warn(
          `Failed to fetch "${options.methodName}" from "${canisterId}" (attempt #${attempt})`,
          e,
        )
        return new Promise<SubmitResponse>((res) => {
          setTimeout(
            () => res(this.call(canisterId, options, identity, attempt + 1)),
            1000 * attempt,
          )
        })
      }
      console.error(`Failed to fetch after ${attempt} attempts`)
      throw e
    }
  }
}

/** We share the same agent across all actors, and replace the identity when identity connection events occur. */
export const agent = new AgentWithRetry({ host: ic.host })

export let rawId: DelegationIdentity | undefined

/**
 * Retrieve the current principal.
 */
export async function fetchPrincipal() {
  const principal = await agent.getPrincipal()
  return principal
}

/**
 * When user connects an identity, we update our agent.
 */
export function replaceIdentity(identity: DelegationIdentity) {
  agent.replaceIdentity(identity)
  agent.getPrincipal().then((principal) => {
    console.debug("replaceIdentity", { principalId: principal.toText() })
  })
  rawId = identity
}

/**
 * When user disconnects an identity, we update our agent.
 */
export function invalidateIdentity() {
  authState.reset()
  agent.invalidateIdentity()
  rawId = undefined
}

// When working locally (or !mainnet) we need to retrieve the root key of the replica.
if (ic.isLocal) agent.fetchRootKey()

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
export const cyclesMinter = actor<CyclesMinter>(
  CYCLES_MINTER_CANISTER_ID,
  cyclesMinterIDL,
)
