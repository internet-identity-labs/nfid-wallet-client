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
    get: () => {
      const { delegationIdentity, identity } = observableAuthState$.getValue()
      if (!delegationIdentity || !identity)
        return observableAuthState$.getValue()

      if (isDelegationExpired(delegationIdentity)) {
        requestFEDelegation(identity)
          .then((result) => {
            authState.set(
              identity,
              result.delegationIdentity,
              ii,
              result.chain,
              result.sessionKey,
            )
          })
          .catch(() => invalidateIdentity())
      }

      return observableAuthState$.getValue()
    },
    reset() {
      observableAuthState$.next({})
    },
    subscribe: (next: (state: ObservableAuthState) => void) =>
      observableAuthState$.subscribe(next),
  }
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
  authState.reset()
  agent.invalidateIdentity()
  rawId = undefined
}
