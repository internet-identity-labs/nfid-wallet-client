import { SignIdentity } from "@dfinity/agent"
import { fromHexString } from "@dfinity/candid/lib/cjs/utils/buffer"
import {
  DelegationChain,
  DelegationIdentity,
  DER_COSE_OID,
  Ed25519KeyIdentity,
  wrapDER,
} from "@dfinity/identity"
import base64url from "base64url"
import { BehaviorSubject, find, lastValueFrom, map } from "rxjs"

import { PassKeyData } from "../_ic_api/passkey_storage.d"
import { passkeyStorage, replaceActorIdentity } from "../actors"
import { agent } from "../agent"
import { isDelegationExpired } from "../agent/is-delegation-expired"
import { Environment } from "../constant/env.constant"
import { AccessPoint } from "../identity-manager/access-points"
import { getPasskey, storePasskey } from "../lambda/passkey"
import { requestFEDelegation } from "./frontend-delegation"
import { setupSessionManager } from "./session-handling"
import { authStorage, KEY_STORAGE_DELEGATION, KEY_STORAGE_KEY } from "./storage"
import {
  createUserIdData,
  deserializeUserIdData,
  serializeUserIdData,
  UserIdData,
} from "./user-id-data"

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

export const EXPECTED_CACHE_VERSION = "0"

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
    debugger

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

    let userIdData

    if (cachedUserIdData) {
      userIdData = deserializeUserIdData(cachedUserIdData as string)
    }
    if (
      !cachedUserIdData ||
      (userIdData && userIdData.cacheVersion !== EXPECTED_CACHE_VERSION)
    ) {
      userIdData = await createUserIdData(delegationIdentity)
      await authStorage.set(
        getUserIdDataStorageKey(delegationIdentity),
        serializeUserIdData(userIdData),
      )
      migratePasskeys(userIdData.accessPoints, delegationIdentity)
    }

    replaceIdentity(delegationIdentity, "_loadAuthSessionFromCache")
    setupSessionManager({ onIdle: invalidateIdentity })

    observableAuthState$.next({
      cacheLoaded: true,
      delegationIdentity,
      activeDevicePrincipalId: delegationIdentity.getPrincipal().toText(),
      identity,
      userIdData,
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
    const userIdData = await createUserIdData(delegationIdentity)

    const current = await authStorage.get(
      getUserIdDataStorageKey(delegationIdentity),
    )
    if (
      !current ||
      deserializeUserIdData(current as string).cacheVersion !==
        EXPECTED_CACHE_VERSION
    ) {
      //soft migration of passkeys
      migratePasskeys(userIdData.accessPoints, delegationIdentity)
    }

    await authStorage.set(
      getUserIdDataStorageKey(delegationIdentity),
      serializeUserIdData(userIdData),
    )

    observableAuthState$.next({
      ...observableAuthState$.getValue(),
      identity,
      delegationIdentity,
      activeDevicePrincipalId: delegationIdentity.getPrincipal().toText(),
      chain,
      sessionKey,
      userIdData,
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

export async function getAllWalletsFromThisDevice() {
  const walletKeys = authStorage
    .getAllKeys()
    .then((keys) => keys.filter((key) => key.startsWith("user_profile_data_")))
  const wallets = await walletKeys.then((keys) =>
    Promise.all(keys.map((key) => authStorage.get(key))),
  )
  const profiles = wallets
    .map((wallet) => {
      return deserializeUserIdData(wallet as string)
    })
    .filter((profile) => profile.cacheVersion === EXPECTED_CACHE_VERSION)
  const profilesData = profiles.map((profile) => {
    return {
      email: profile.email,
      principal: profile.userId,
      credentialIds: profile.accessPoints
        .map((l) => l.credentialId)
        .filter((id) => id !== undefined),
      anchor: profile.anchor,
    }
  })

  const passkey: PassKeyData[][] = await Promise.all(
    profilesData.map(async (profile) => {
      return passkeyStorage.get_passkey_by_anchor(profile.anchor)
    }),
  )

  const decodedObject = passkey.flat().map((p) => JSON.parse(p.data))
  console.debug("passkeys", { decodedObject })
  const allowedPasskeys = decodedObject.map((p) => {
    return {
      ...p,
      credentialId: base64url.toBuffer(p.credentialId),
      pubkey: wrapDER(fromHexString(p.publicKey), DER_COSE_OID) as any,
    }
  })

  return profilesData
    .map((profile) => {
      return {
        ...profile,
        allowedPasskeys: allowedPasskeys.filter((p) => {
          return profile.credentialIds.includes(
            base64url.encode(p.credentialId),
          )
        }),
      }
    })
    .filter((profile) => profile.allowedPasskeys.length > 0)
}

export async function migratePasskeys(
  accessPoints: AccessPoint[],
  identity: DelegationIdentity,
) {
  await replaceActorIdentity(passkeyStorage, identity)
  for (const accessPoint of accessPoints.filter(
    (ap) => ap.credentialId !== undefined,
  )) {
    const passkey = await getPasskey([accessPoint.credentialId!])
    storePasskey(passkey[0].key, passkey[0].data)
  }
}

export const authState = makeAuthState()
