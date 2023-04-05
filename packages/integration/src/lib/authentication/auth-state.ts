import { SignIdentity } from "@dfinity/agent"
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import { BehaviorSubject } from "rxjs"

import { agent } from "../agent"
import { isDelegationExpired } from "../agent/is-delegation-expired"
import { requestFEDelegation } from "./frontend-delegation"
import { setupSessionManager } from "./session-handling"
import { authStorage, KEY_STORAGE_DELEGATION, KEY_STORAGE_KEY } from "./storage"

interface ObservableAuthState {
  cacheLoaded: boolean
  //
  identity?: SignIdentity // Device Identity (different for each device and browser combination)
  delegationIdentity?: DelegationIdentity // User Identity (unique across all users devices)
  //
  // This is only required to remote authenticate via post message channel
  chain?: DelegationChain
  sessionKey?: Ed25519KeyIdentity
}

const observableAuthState$ = new BehaviorSubject<ObservableAuthState>({
  cacheLoaded: false,
})

observableAuthState$.subscribe({
  error(err) {
    console.error("observableAuthState: something went wrong:", { err })
  },
  complete() {
    console.debug("observableAuthState done")
  },
})

type SetProps = {
  identity: SignIdentity
  delegationIdentity: DelegationIdentity
  chain?: DelegationChain | undefined
  sessionKey?: Ed25519KeyIdentity | undefined
}

async function _hydrate() {
  const sessionKey = await authStorage.get(KEY_STORAGE_KEY)
  const chain = await authStorage.get(KEY_STORAGE_DELEGATION)
  if (!sessionKey || !chain) return

  const delegationIdentity = DelegationIdentity.fromDelegation(
    Ed25519KeyIdentity.fromJSON(sessionKey),
    DelegationChain.fromJSON(chain),
  )
  // TODO: check delegation expiration

  console.debug("_hydrate", {
    principalId: delegationIdentity.getPrincipal().toText(),
  })

  observableAuthState$.next({
    cacheLoaded: true,
    delegationIdentity,
  })
}

function makeAuthState() {
  let pendingRenewDelegation = false
  _hydrate()

  function set({ identity, delegationIdentity, chain, sessionKey }: SetProps) {
    setupSessionManager({ onIdle: invalidateIdentity })
    observableAuthState$.next({
      ...observableAuthState$.getValue(),
      identity,
      delegationIdentity,
      chain,
      sessionKey,
    })
    replaceIdentity(delegationIdentity)
  }
  function get() {
    checkAndRenewFEDelegation()
    return observableAuthState$.getValue()
  }
  function reset() {
    observableAuthState$.next({
      cacheLoaded: true,
    })
  }
  function subscribe(next: (state: ObservableAuthState) => void) {
    return observableAuthState$.subscribe(next)
  }

  function checkAndRenewFEDelegation() {
    const { delegationIdentity, identity } = observableAuthState$.getValue()

    if (!delegationIdentity || !identity || pendingRenewDelegation) return

    if (isDelegationExpired(delegationIdentity)) {
      pendingRenewDelegation = true

      return requestFEDelegation(identity)
        .then((result) => {
          pendingRenewDelegation = false
          set({
            identity,
            delegationIdentity: result.delegationIdentity,
            chain: result.chain,
            sessionKey: result.sessionKey,
          })
        })
        .catch((e) => {
          console.error("checkDelegationExpiration", e)
          invalidateIdentity()
        })
    }
    return
  }

  /**
   * When user disconnects an identity, we update our agent.
   */
  function invalidateIdentity() {
    console.debug("invalidateIdentity")
    reset()
    agent.invalidateIdentity()
    window.location.reload()
  }
  return {
    set,
    get,
    reset,
    subscribe,
    checkAndRenewFEDelegation,
    logout: invalidateIdentity,
  }
}

export const authState = makeAuthState()

/**
 * When user connects an identity, we update our agent.
 */
export function replaceIdentity(identity: SignIdentity) {
  agent.replaceIdentity(identity)
  agent.getPrincipal().then((principal) => {
    console.debug("replaceIdentity", { principalId: principal.toText() })
  })
}
