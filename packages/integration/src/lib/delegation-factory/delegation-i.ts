import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"

import { ONE_HOUR_IN_MS } from "@nfid/config"

import { integrationCache } from "../../cache"
import { im } from "../actors"
import { authState } from "../authentication"
import {
  DEFAULT_EXPIRAITON_TIME_MILLIS,
  getFromStorage,
  saveToStorage,
} from "../lambda/domain-key-repository"
import {
  fromHexString,
  getAnonymousDelegationThroughLambda,
  getLambdaPublicKey,
  oldFlowDelegationChainLambda,
  oldFlowGlobalKeysFromLambda,
} from "../lambda/lambda-delegation"
import { validateTargets } from "../lambda/targets"
import {
  getDelegationChainSignedByCanister,
  getPrincipalSignedByCanister,
} from "./delegation-factory"

export enum DelegationType {
  GLOBAL = "GLOBAL",
  ANONYMOUS = "ANONYMOUS",
}

export const GLOBAL_ORIGIN = "nfid.one"
export const ANCHOR_TO_GET_DELEGATION_FROM_DF = BigInt(200_000_000)

export async function getGlobalDelegationChain(
  identity: DelegationIdentity,
  targets: string[],
  sessionPublicKey: Uint8Array,
  origin: string,
  maxTimeToLive = ONE_HOUR_IN_MS * 2,
): Promise<DelegationChain> {
  // //ICRC28
  await validateTargets(targets, origin)

  const userData = authState.getUserIdData()

  let response

  if (isCanisterDelegation(userData.anchor)) {
    response = getDelegationChainSignedByCanister(
      identity,
      targets,
      sessionPublicKey,
      userData.anchor,
      GLOBAL_ORIGIN,
      maxTimeToLive,
    )
  } else {
    //deprecated flow
    response = oldFlowGlobalKeysFromLambda(
      identity,
      targets,
      sessionPublicKey,
      maxTimeToLive,
    )
  }

  //save to temp storage for renew delegation flow
  await saveToStorage(
    origin,
    toHexString(sessionPublicKey),
    DEFAULT_EXPIRAITON_TIME_MILLIS,
  )

  return response
}

//renew delegation for same session public key
export async function renewDelegationThirdParty(
  identity: DelegationIdentity,
  targets: string[],
  origin: string,
  sessionPublicKey: Uint8Array,
): Promise<DelegationChain> {
  const sessionPublicKeyFromStorage = new Uint8Array(
    fromHexString(await getFromStorage(origin)),
  )

  const textDecoder = new TextDecoder()

  const spkHexFromStorage = textDecoder.decode(sessionPublicKeyFromStorage)

  const spkHexFromThirdparty = textDecoder.decode(sessionPublicKey)

  if (spkHexFromStorage !== spkHexFromThirdparty)
    throw new Error("Cannot renew delegation for different session public key")

  return getGlobalDelegationChain(identity, targets, sessionPublicKey, origin)
}

export async function getGlobalDelegation(
  identity: DelegationIdentity,
  targets: string[],
  origin = GLOBAL_ORIGIN,
): Promise<DelegationIdentity> {
  return requestManager.executeRequest(
    JSON.stringify({ identity, targets }),
    async () => {
      const cachedValue = await integrationCache.getItem(
        JSON.stringify({ identity, targets }),
      )

      if (cachedValue) return cachedValue as any

      const sessionKey = Ed25519KeyIdentity.generate()

      const userData = authState.getUserIdData()

      let delegationChain

      if (isCanisterDelegation(userData.anchor)) {
        const pk = new Uint8Array(sessionKey.getPublicKey().toDer())
        delegationChain = await getDelegationChainSignedByCanister(
          identity,
          targets,
          pk,
          userData.anchor,
          origin,
        )
      } else {
        //deprecated flow
        delegationChain = await oldFlowDelegationChainLambda(
          identity,
          sessionKey,
          targets,
        )
      }
      const response = DelegationIdentity.fromDelegation(
        sessionKey,
        delegationChain,
      )

      await integrationCache.setItem(
        JSON.stringify({ identity, targets }),
        response,
        { ttl: 600 },
      )

      return response
    },
  )
}

/**
 * Retrieves an anonymous delegation chain from the server using ECDSA.
 * @param domain - The domain requesting the delegation.
 * @param sessionKey - The session key as a Uint8Array.
 * @param identity - The users delegation identity.
 * @param chain - The target blockchain.
 * @param maxTimeToLive - The maximum time to live for the delegation chain, in milliseconds. Defaults to 2 hours.
 * @returns A Promise that resolves to a DelegationChain object.
 */
export async function getAnonymousDelegation(
  domain: string,
  sessionKey: Uint8Array,
  identity: DelegationIdentity,
  maxTimeToLive = ONE_HOUR_IN_MS * 2,
): Promise<DelegationChain> {
  const userData = authState.getUserIdData()
  if (isCanisterDelegation(userData.anchor)) {
    return await getDelegationChainSignedByCanister(
      identity,
      undefined,
      sessionKey,
      userData.anchor,
      domain,
    )
  } else {
    //deprecated flow
    return await getAnonymousDelegationThroughLambda(
      domain,
      sessionKey,
      identity,
      maxTimeToLive,
    )
  }
}

export async function getPublicKey(
  identity: DelegationIdentity,
  origin = GLOBAL_ORIGIN,
  type = DelegationType.GLOBAL,
): Promise<string> {
  const cacheKey =
    "getPublicKey" + identity.getPrincipal().toText() + type.toString()

  const cachedValue = await integrationCache.getItem(cacheKey)

  if (cachedValue) return cachedValue as any

  const account = await im.get_account()

  const anchor = account.data[0]!.anchor

  if (isCanisterDelegation(anchor)) {
    const principal = await getPrincipalSignedByCanister(anchor, origin)
    await integrationCache.setItem(cacheKey, principal.toText(), {
      ttl: 60000,
    })
    return principal.toText()
  } else {
    const key = await getLambdaPublicKey(
      identity,
      origin,
      type,
      account.data[0]?.principal_id,
    )
    await integrationCache.setItem(cacheKey, key, {
      ttl: 60000,
    })
    return key
  }
}

export async function createDelegationChain(
  identity: DelegationIdentity,
  lambdaPublicKey: string,
  expirationDate: Date,
  options: Record<string, any>,
): Promise<DelegationChain> {
  return await DelegationChain.create(
    identity,
    Ed25519KeyIdentity.fromParsedJson([lambdaPublicKey, "0"]).getPublicKey(),
    expirationDate,
    options,
  )
}

export function toHexString(bytes: ArrayBuffer): string {
  return new Uint8Array(bytes).reduce(
    (str, byte) => str + byte.toString(16).padStart(2, "0"),
    "",
  )
}

//all new users have anchor >= 200_000_000
function isCanisterDelegation(anchor: bigint) {
  return anchor >= ANCHOR_TO_GET_DELEGATION_FROM_DF
}

class RequestManager {
  private static instance: RequestManager
  private pendingRequests: Map<string, Promise<any>> = new Map()

  static getInstance(): RequestManager {
    if (!RequestManager.instance) {
      RequestManager.instance = new RequestManager()
    }
    return RequestManager.instance
  }

  async executeRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
  ): Promise<T> {
    // Если запрос уже выполняется, возвращаем существующий Promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!
    }

    // Создаем новый запрос
    const promise = requestFn().finally(() => {
      // Удаляем из pending после завершения
      this.pendingRequests.delete(key)
    })

    this.pendingRequests.set(key, promise)
    return promise
  }
}

const requestManager = RequestManager.getInstance()
