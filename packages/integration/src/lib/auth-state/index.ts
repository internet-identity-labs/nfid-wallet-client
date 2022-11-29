import { ActorSubclass, SignIdentity } from "@dfinity/agent"
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import { BehaviorSubject } from "rxjs"

import { _SERVICE as InternetIdentity } from "../_ic_api/internet_identity.d"
import { ii } from "../actors"
import { agent } from "../agent"
import { isDelegationExpired } from "../agent/is-delegation-expired"
import { requestFEDelegation } from "../identity/frontend-delegation"
import { setupSessionManager } from "./session-handling"

interface ObservableAuthState {
  pendingRenewDelegation?: boolean
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
      setupSessionManager({ onIdle: invalidateIdentity })
      observableAuthState$.next({
        pendingRenewDelegation: false,
        actor,
        identity,
        delegationIdentity,
        chain,
        sessionKey,
      })
      replaceIdentity(delegationIdentity)
    },
    get: () => {
      checkDelegationExpiration()
      return observableAuthState$.getValue()
    },
    reset() {
      observableAuthState$.next({})
    },
    subscribe: (next: (state: ObservableAuthState) => void) =>
      observableAuthState$.subscribe(next),
    setRenewDelegationStatus: (isPending: boolean) => {
      observableAuthState$.next({
        ...observableAuthState$.getValue(),
        pendingRenewDelegation: isPending,
      })
    },
  }
}

export function checkDelegationExpiration() {
  const { pendingRenewDelegation, delegationIdentity, identity } =
    observableAuthState$.getValue()

  if (!delegationIdentity || !identity || pendingRenewDelegation) return

  if (isDelegationExpired(delegationIdentity)) {
    authState.setRenewDelegationStatus(true)

    return requestFEDelegation(identity)
      .then((result) => {
        authState.set(
          identity,
          result.delegationIdentity,
          ii,
          result.chain,
          result.sessionKey,
        )
      })
      .catch((e) => {
        console.error("checkDelegationExpiration", e)
        invalidateIdentity()
      })
  }
  return
}

export const authState = authStateClosure()

export let rawId: DelegationIdentity | undefined
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
  console.debug("invalidateIdentity")
  authState.reset()
  agent.invalidateIdentity()
  window.location.reload()
  rawId = undefined
}
