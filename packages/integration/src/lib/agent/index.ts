import * as Agent from "@dfinity/agent"
import { Identity, SubmitResponse } from "@dfinity/agent"
import { ActorSubclass, SignIdentity } from "@dfinity/agent"
import {
  DelegationIdentity,
  DelegationChain,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { BehaviorSubject } from "rxjs"

import { _SERVICE as InternetIdentity } from "../_ic_api/internet_identity.d"

// Envars
declare const II_ENV: string
declare const IS_DEV: string
declare const IC_HOST: string

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
  override call(
    canisterId: Principal | string,
    options: {
      methodName: string
      arg: ArrayBuffer
      effectiveCanisterId?: Principal | string
    },
    identity?: Identity | Promise<Identity>,
    attempt = 1,
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

interface ObservableAuthState {
  actor?: ActorSubclass<InternetIdentity>
  identity?: SignIdentity
  delegationIdentity?: DelegationIdentity
  chain?: DelegationChain
  sessionKey?: Ed25519KeyIdentity
}

const observableAuthState$ = new BehaviorSubject<ObservableAuthState>({})

observableAuthState$.subscribe({
  next(value) {
    console.debug("observableAuthState new state", { value })
  },
  error(err) {
    console.error("observableAuthState: something went wrong:", { err })
  },
  complete() {
    console.debug("observableAuthState done")
  },
})

function authStateClosure() {
  return {
    set(
      identity: SignIdentity,
      delegationIdentity: DelegationIdentity,
      actor: ActorSubclass<InternetIdentity>,
      chain?: DelegationChain | undefined,
      sessionKey?: Ed25519KeyIdentity | undefined,
    ) {
      observableAuthState$.next({
        actor,
        identity,
        delegationIdentity,
        chain,
        sessionKey,
      })
      replaceIdentity(delegationIdentity)
    },
    get: () => observableAuthState$.getValue(),
    reset() {
      observableAuthState$.next({})
    },
    subscribe: (next: (state: ObservableAuthState) => void) =>
      observableAuthState$.subscribe(next),
  }
}

export const authState = authStateClosure()
