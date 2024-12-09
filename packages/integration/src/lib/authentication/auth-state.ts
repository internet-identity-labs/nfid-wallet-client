import { SignIdentity } from "@dfinity/agent"
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import { BehaviorSubject, find, lastValueFrom, map } from "rxjs"

import { im, replaceActorIdentity } from "../actors"
import { agent } from "../agent"
import { isDelegationExpired } from "../agent/is-delegation-expired"
import { Environment } from "../constant/env.constant"
import { getPublicKey } from "../delegation-factory/delegation-i"
import { RootWallet } from "../identity-manager/profile"
import { hasOwnProperty } from "../test-utils"
import { requestFEDelegation } from "./frontend-delegation"
import { setupSessionManager } from "./session-handling"
import { authStorage, KEY_STORAGE_DELEGATION, KEY_STORAGE_KEY } from "./storage"

interface ObservableAuthState {
  cacheLoaded: boolean
  //
  identity?: SignIdentity
  delegationIdentity?: DelegationIdentity
  chain?: DelegationChain
  sessionKey?: Ed25519KeyIdentity
  activeDevicePrincipalId?: string
  userIdData?: UserIdData
}

type UserIdData = {
  //internal user id
  userId: string
  //public key of the user
  publicKey: string
  anchor: bigint
  wallet: RootWallet
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
  console.debug("makeAuthState")
  let pendingRenewDelegation = false
  _loadAuthSessionFromCache()

  const isNonSensitiveEnv = ![Environment.STAGE, Environment.IC].includes(
    ENV as Environment,
  )

  if (isNonSensitiveEnv && typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.setAuthState = _setAuthSession
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.resetAuthState = _clearAuthSessionFromCache
  }

  async function _loadAuthSessionFromCache() {
    console.debug("_loadAuthSessionFromCache", Date.now())
    let sessionKey
    let chain
    try {
      sessionKey = await authStorage.get(KEY_STORAGE_KEY)
      chain = await authStorage.get(KEY_STORAGE_DELEGATION)
    } catch (error) {
      console.error("_loadAuthSessionFromCache", { error })
    }
    if (!sessionKey || !chain) {
      observableAuthState$.next({
        cacheLoaded: true,
      })
      return
    }

    if (typeof sessionKey !== "string") {
      sessionKey = JSON.stringify(sessionKey)
    }

    if (typeof chain !== "string") {
      chain = JSON.stringify(chain)
    }

    console.debug(
      "_loadAuthSessionFromCache load sessionKey and chain from cache. Recreate identity and delegationIdentity",
    )
    const identity = Ed25519KeyIdentity.fromJSON(sessionKey)

    const delegationIdentity = DelegationIdentity.fromDelegation(
      identity,
      DelegationChain.fromJSON(chain),
    )

    if (isDelegationExpired(delegationIdentity)) {
      console.debug(
        "_loadAuthSessionFromCache load sessionKey and chain from cache. Session expired",
      )
      return observableAuthState$.next({
        cacheLoaded: true,
      })
    }

    const cachedUserIdData = await authStorage.get(
      getUserIdDataStorageKey(delegationIdentity),
    )

    replaceIdentity(delegationIdentity, "_loadAuthSessionFromCache")
    setupSessionManager({ onIdle: invalidateIdentity })

    observableAuthState$.next({
      cacheLoaded: true,
      delegationIdentity,
      activeDevicePrincipalId: delegationIdentity.getPrincipal().toText(),
      identity,
      userIdData: cachedUserIdData
        ? JSON.parse(cachedUserIdData as string)
        : await createUserIdData(delegationIdentity),
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

  async function set({
    identity,
    delegationIdentity,
    chain,
    sessionKey,
  }: SetProps) {
    console.debug("makeAuthState set new auth state")
    observableAuthState$.next({
      ...observableAuthState$.getValue(),
      identity,
      delegationIdentity,
      activeDevicePrincipalId: delegationIdentity.getPrincipal().toText(),
      chain,
      sessionKey,
      userIdData: await createUserIdData(delegationIdentity),
    })
    replaceIdentity(delegationIdentity, "authState.set")
    setupSessionManager({ onIdle: invalidateIdentity })
  }

  function get() {
    checkAndRenewFEDelegation()
    return observableAuthState$.getValue()
  }

  async function reset() {
    await _clearAuthSessionFromCache()
    console.debug("invalidateIdentity")
    agent.invalidateIdentity()
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
      console.debug("checkAndRenewFEDelegation", { delegationExpired: true })
      pendingRenewDelegation = true

      return requestFEDelegation(identity)
        .then(async (result) => {
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
    getUserIdData: () => {
      const state = get()
      if (!state.userIdData) throw new Error("No user data")
      return state.userIdData
    },
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

function getUserIdDataStorageKey(delegationIdentity: DelegationIdentity) {
  return "user_profile_data_" + delegationIdentity.getPrincipal().toText()
}

async function createUserIdData(delegationIdentity: DelegationIdentity) {
  const cacheKey =
    "user_profile_data_" + delegationIdentity.getPrincipal().toText()
  await replaceActorIdentity(im, delegationIdentity)
  const [publicKey, account] = await Promise.all([
    getPublicKey(delegationIdentity),
    im.get_account(),
  ])
  const rootWallet: RootWallet = hasOwnProperty(account.data[0]!.wallet, "II")
    ? RootWallet.II
    : RootWallet.NFID
  const data = {
    userId: account.data[0]!.principal_id,
    publicKey: publicKey,
    //BigInt is not serializable in a good way
    anchor: Number(account.data[0]!.anchor),
    wallet: rootWallet,
  }
  await authStorage.set(cacheKey, JSON.stringify(data))
  return { ...data, anchor: BigInt(data.anchor) }
}
