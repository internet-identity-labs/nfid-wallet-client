import { AnonymousIdentity, Identity, SignIdentity } from "@dfinity/agent"
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
import { im, passkeyStorage, replaceActorIdentity } from "../actors"
import { agent } from "../agent"
import { isDelegationExpired } from "../agent/is-delegation-expired"
import { Environment } from "../constant/env.constant"
import { getPasskey, storePasskey } from "../lambda/passkey"
import { requestFEDelegation } from "./frontend-delegation"
import { setupSessionManager } from "./session-handling"
import {
  authStorage,
  KEY_BTC_ADDRESS,
  KEY_ETH_ADDRESS,
  KEY_STORAGE_DELEGATION,
  KEY_STORAGE_KEY,
} from "./storage"
import {
  createUserIdData,
  deserializeUserIdData,
  serializeUserIdData,
  UserIdData,
} from "./user-id-data"
import { AuthClient } from "@dfinity/auth-client"

interface ObservableAuthState {
  cacheLoaded: boolean
  identity?: SignIdentity
  delegationIdentity?: DelegationIdentity
  chain?: DelegationChain
  sessionKey?: Ed25519KeyIdentity
  activeDevicePrincipalId?: string
  userIdData?: UserIdData
}

export interface ExistingWallet {
  allowedPasskeys: { credentialId: Buffer; pubkey: any; anchor: bigint }[]
  email: string | undefined
  principal: string
  name: string | undefined
}

export const EXPECTED_CACHE_VERSION = "1"

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
    let delegationIdentity
    try {
      sessionKey = await authStorage.get(KEY_STORAGE_KEY)
      chain = await authStorage.get(KEY_STORAGE_DELEGATION)
    } catch (error) {
      console.error("_loadAuthSessionFromCache", { error })
    }
    if (!sessionKey || !chain) {
      let isIIAuth = await AuthClient.create().then(async (authClient) => {
        const isAuthenticated = await authClient.isAuthenticated()

        if (isAuthenticated) {
          delegationIdentity = authClient.getIdentity() as DelegationIdentity
        }

        return isAuthenticated
      })

      if (!isIIAuth) {
        observableAuthState$.next({
          cacheLoaded: true,
        })
        return
      }
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
    const identity = Ed25519KeyIdentity.generate()

    if (!sessionKey && !chain) {
      delegationIdentity = DelegationIdentity.fromDelegation(
        identity,
        DelegationChain.fromJSON("1"),
      )
    }

    if (isDelegationExpired(delegationIdentity)) {
      console.debug(
        "_loadAuthSessionFromCache load sessionKey and chain from cache. Session expired",
      )
      return observableAuthState$.next({
        cacheLoaded: true,
      })
    }

    const cachedUserIdData = await authStorage.get(
      getUserIdDataStorageKey(delegationIdentity!),
    )

    let userIdData

    if (cachedUserIdData) {
      userIdData = deserializeUserIdData(cachedUserIdData as string)
    }
    if (
      !cachedUserIdData ||
      (userIdData && userIdData.cacheVersion !== EXPECTED_CACHE_VERSION)
    ) {
      userIdData = await createUserIdData(delegationIdentity!)
      await authStorage.set(
        getUserIdDataStorageKey(delegationIdentity!),
        serializeUserIdData(userIdData),
      )
      migratePasskeys(delegationIdentity!)
    }

    replaceIdentity(delegationIdentity!, "_loadAuthSessionFromCache")
    setupSessionManager({ onIdle: invalidateIdentity })

    observableAuthState$.next({
      cacheLoaded: true,
      delegationIdentity,
      activeDevicePrincipalId: delegationIdentity!.getPrincipal().toText(),
      identity,
      userIdData,
    })
  }

  async function _setAuthSession(authState: {
    delegation: string
    identity: string
    bitcoin: {
      key: string
      value: string
    }
  }) {
    console.debug("_setAuthSession", { authState })
    await Promise.all([
      authStorage.set(KEY_STORAGE_KEY, authState.identity),
      authStorage.set(KEY_STORAGE_DELEGATION, authState.delegation),
      ...(authState.bitcoin
        ? [authStorage.set(authState.bitcoin.key, authState.bitcoin.value)]
        : []),
    ])
    await _loadAuthSessionFromCache()
    return true
  }

  async function _clearAuthSessionFromCache() {
    await Promise.all([
      authStorage.remove(KEY_STORAGE_KEY),
      authStorage.remove(KEY_STORAGE_DELEGATION),
      authStorage.remove(KEY_BTC_ADDRESS),
      authStorage.remove(KEY_ETH_ADDRESS),
      AuthClient.create().then(async (authClient) => {
        const isAuthenticated = await authClient.isAuthenticated()

        if (isAuthenticated) {
          authClient.logout()
        }
      }),
    ])
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
      migratePasskeys(delegationIdentity)
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
    agent.replaceIdentity(new AnonymousIdentity())
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
export function replaceIdentity(identity: Identity, calledFrom?: string) {
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

export async function getAllWalletsFromThisDevice(): Promise<ExistingWallet[]> {
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

  const profilesData = profiles
    .filter((profile) => profile.email || profile.name)
    .reduce(
      (acc, profile) => {
        const newProfile = {
          email: profile.email,
          principal: profile.publicKey,
          anchor: profile.anchor,
          name: profile.name,
        }

        const isDuplicate = acc.some((p) => p.anchor === newProfile.anchor)

        if (!isDuplicate) {
          acc.push(newProfile)
        }

        return acc
      },
      [] as {
        email: string | undefined
        principal: string
        anchor: bigint
        name: string | undefined
      }[],
    )

  const parsedCredentialIds: string[] = await authStorage
    .get("credentialIds")
    .then((passkeysUsedOnThisDevice) =>
      passkeysUsedOnThisDevice
        ? JSON.parse(passkeysUsedOnThisDevice as string)
        : [],
    )

  const passkeysFromAPI: {
    data: PassKeyData[]
    anchor: bigint
  }[] = await Promise.all(
    profilesData.map(async (profile) => {
      return passkeyStorage.get_passkey_by_anchor(profile.anchor).then((p) => {
        return {
          data: p,
          anchor: profile.anchor,
        }
      })
    }),
  ).then((p) => p.filter((p) => p.data.length !== 0))

  const parsedAllowedPasskeysByAnchor = passkeysFromAPI
    .map((p) =>
      p.data
        .map((d) => JSON.parse(d.data))
        .filter((l) => parsedCredentialIds.includes(l.credentialId))
        .map((s) => {
          return {
            credentialId: base64url.toBuffer(s.credentialId),
            pubkey: wrapDER(fromHexString(s.publicKey), DER_COSE_OID) as any,
            anchor: p.anchor,
          }
        }),
    )
    .flat()

  return profilesData
    .map((profile) => {
      return {
        ...profile,
        allowedPasskeys: parsedAllowedPasskeysByAnchor.filter((s) => {
          return s.anchor === profile.anchor
        }),
      }
    })
    .filter(
      (profile) =>
        profile.allowedPasskeys !== undefined &&
        profile.allowedPasskeys.length !== 0,
    )
}

export async function migratePasskeys(identity: DelegationIdentity) {
  await replaceActorIdentity(passkeyStorage, identity)
  const credentialIds: string[] = await im.get_account().then((account) =>
    account.data[0]!.access_points.map((ap) => ap.credential_id)
      .filter((id) => id !== undefined && id.length !== 0)
      .flat(),
  )
  for (const credentialId of credentialIds) {
    const passkey = await getPasskey([credentialId!])
    storePasskey(passkey[0].key, passkey[0].data)
  }
}

export const authState = makeAuthState()
