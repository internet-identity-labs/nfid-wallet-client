import { SignIdentity } from "@dfinity/agent"
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import posthog from "posthog-js"
import { BehaviorSubject, find, lastValueFrom, map } from "rxjs"

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
  identity?: SignIdentity
  delegationIdentity: DelegationIdentity
  chain?: DelegationChain | undefined
  sessionKey?: Ed25519KeyIdentity | undefined
}

function makeAuthState() {
  let pendingRenewDelegation = false
  _loadAuthSessionFromCache()

  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.resetAuthState = invalidateIdentity
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.setAuthState = _setAuthSession
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.resetAuthState = _clearAuthSessionFromCache
  }

  async function _loadAuthSessionFromCache() {
    let sessionKey = await authStorage.get(KEY_STORAGE_KEY)
    let chain = await authStorage.get(KEY_STORAGE_DELEGATION)
    if (!sessionKey || !chain) {
      return observableAuthState$.next({
        cacheLoaded: true,
      })
    }

    if (typeof sessionKey !== "string") {
      sessionKey = JSON.stringify(sessionKey)
    }

    if (typeof chain !== "string") {
      chain = JSON.stringify(chain)
    }

    const identity = Ed25519KeyIdentity.fromJSON(sessionKey)

    const delegationIdentity = DelegationIdentity.fromDelegation(
      identity,
      DelegationChain.fromJSON(chain),
    )

    if (isDelegationExpired(delegationIdentity)) {
      return observableAuthState$.next({
        cacheLoaded: true,
      })
    }

    replaceIdentity(delegationIdentity, "_loadAuthSessionFromCache")

    console.debug("_hydrate", {
      principalId: delegationIdentity.getPrincipal().toText(),
    })

    observableAuthState$.next({
      cacheLoaded: true,
      delegationIdentity,
      identity,
    })
  }

  async function _setAuthSession(authState: {
    delegation: string
    identity: string
  }) {
    console.debug("_setAuthSession", { authState })
    await Promise.all([
      authStorage.set(KEY_STORAGE_KEY, authState.identity),
      authStorage.set(KEY_STORAGE_DELEGATION, authState.delegation),
    ])
    await _loadAuthSessionFromCache()
    return true
  }

  async function _clearAuthSessionFromCache() {
    await Promise.all([
      authStorage.remove(KEY_STORAGE_KEY),
      authStorage.remove(KEY_STORAGE_DELEGATION),
    ])
    return true
  }

  async function fromCache() {
    const cacheLoaded$ = observableAuthState$.pipe(
      find((s) => s.cacheLoaded),
      map((s) => ({
        ...s,
        delegationIdentity: isDelegationExpired(s?.delegationIdentity)
          ? undefined
          : s?.delegationIdentity,
      })),
    )
    return await lastValueFrom(cacheLoaded$)
  }

  function set({ identity, delegationIdentity, chain, sessionKey }: SetProps) {
    console.debug("makeAuthState set new auth state")
    setupSessionManager({ onIdle: invalidateIdentity })
    observableAuthState$.next({
      ...observableAuthState$.getValue(),
      identity,
      delegationIdentity,
      chain,
      sessionKey,
    })
    replaceIdentity(delegationIdentity, "authState.set")
  }
  function get() {
    checkAndRenewFEDelegation()
    return observableAuthState$.getValue()
  }
  async function reset(hard = true) {
    await _clearAuthSessionFromCache()
    console.debug("invalidateIdentity")
    agent.invalidateIdentity()
    observableAuthState$.next({
      cacheLoaded: true,
    })
    // clear tracking session
    hard && posthog.reset()
  }
  function subscribe(next: (state: ObservableAuthState) => void) {
    return observableAuthState$.subscribe(next)
  }

  function checkAndRenewFEDelegation() {
    console.debug("checkAndRenewFEDelegation", { pendingRenewDelegation })
    const { delegationIdentity, identity } = observableAuthState$.getValue()

    if (!delegationIdentity || !identity || pendingRenewDelegation) return

    if (isDelegationExpired(delegationIdentity)) {
      console.debug("checkAndRenewFEDelegation", { delegationExpired: true })
      pendingRenewDelegation = true

      return requestFEDelegation(identity)
        .then((result) => {
          set({
            identity,
            delegationIdentity: result.delegationIdentity,
            chain: result.chain,
            sessionKey: result.sessionKey,
          })
        })
        .catch(invalidateIdentity)
        .finally(() => {
          console.debug("checkAndRenewFEDelegation requestFEDelegation done")
          pendingRenewDelegation = false
        })
    }
    return
  }

  /**
   * When user disconnects an identity, we update our agent.
   */
  async function invalidateIdentity(hard = true) {
    console.debug("makeAuthState invalidateIdentity")
    await reset()
    hard && window.location.reload()
  }
  return {
    set,
    get,
    reset,
    subscribe,
    fromCache,
    checkAndRenewFEDelegation,
    logout: invalidateIdentity,
  }
}

export const authState = makeAuthState()

/**
 * When user connects an identity, we update our agent.
 */
export function replaceIdentity(identity: SignIdentity, calledFrom?: string) {
  agent.replaceIdentity(identity)
  agent.getPrincipal().then((principal) => {
    console.debug(`replaceIdentity calledFrom: ${calledFrom}`, {
      principalId: principal.toText(),
    })
  })
}
