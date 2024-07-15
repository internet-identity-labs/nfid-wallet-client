import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import { Principal } from "@dfinity/principal"

import { ONE_HOUR_IN_MS, ONE_MINUTE_IN_MS } from "@nfid/config"

import { integrationCache } from "../../cache"
import { HTTPAccountResponse } from "../_ic_api/identity_manager.d"
import {
  btcSigner,
  delegationFactory,
  ecdsaSigner,
  icSigner,
  im,
  replaceActorIdentity,
} from "../actors"
import { ic } from "../agent/index"
import {
  getDelegationChainSignedByCanister,
  getPrincipalSignedByCanister,
} from "./delegation-factory"
import {
  defaultExpirationInMinutes,
  deleteFromStorage,
  getFromStorage,
  saveToStorage,
} from "./domain-key-repository"
import { validateTargets } from "./targets"

const GLOBAL_ORIGIN = "nfid.one"
export const ANCHOR_TO_GET_DELEGATION_FROM_DF = BigInt(200_000_000)

export enum Chain {
  BTC = "BTC",
  ETH = "ETH",
  IC = "IC",
}

export async function getGlobalKeysThirdParty(
  identity: DelegationIdentity,
  targets: string[],
  sessionPublicKey: Uint8Array,
  origin: string,
  maxTimeToLive = ONE_HOUR_IN_MS * 2,
): Promise<DelegationChain> {
  await validateTargets(targets, origin)
  await replaceActorIdentity(im, identity)
  const account: HTTPAccountResponse = await im.get_account()
  const anchor = account.data[0]?.anchor
  let response
  if (anchor && anchor >= ANCHOR_TO_GET_DELEGATION_FROM_DF) {
    await replaceActorIdentity(delegationFactory, identity)
    response = getDelegationChainSignedByCanister(
      identity,
      targets,
      sessionPublicKey,
      anchor,
      origin,
      maxTimeToLive,
    )
  } else {
    response = oldFlowGlobalKeysFromLambda(
      identity,
      targets,
      sessionPublicKey,
      origin,
      maxTimeToLive,
    )
  }

  saveToStorage(
    origin,
    toHexString(sessionPublicKey),
    defaultExpirationInMinutes,
  )
  return response
}

export async function renewDelegationThirdParty(
  identity: DelegationIdentity,
  targets: string[],
  origin: string,
  sessionPublicKey: Uint8Array,
): Promise<DelegationChain> {
  const sessionPublicKeyFromStorage = new Uint8Array(
    fromHexString(getFromStorage(origin)),
  )
  const textDecoder = new TextDecoder()
  const spkHexFromStorage = textDecoder.decode(sessionPublicKeyFromStorage)
  const spkHexFromThirdparty = textDecoder.decode(sessionPublicKey)
  if (spkHexFromStorage !== spkHexFromThirdparty)
    throw new Error("Cannot renew delegation for different session public key")

  return getGlobalKeysThirdParty(identity, targets, sessionPublicKey, origin)
}

export async function getGlobalKeys(
  identity: DelegationIdentity,
  chain: Chain,
  targets: string[],
  origin = GLOBAL_ORIGIN,
): Promise<DelegationIdentity> {
  const cachedValue = await integrationCache.getItem(
    JSON.stringify({ identity, chain, targets }),
  )
  if (cachedValue) return cachedValue as any

  const sessionKey = Ed25519KeyIdentity.generate()
  await replaceActorIdentity(im, identity)
  const account: HTTPAccountResponse = await im.get_account()
  const anchor = account.data[0]?.anchor
  let delegationChain
  if (anchor && anchor >= ANCHOR_TO_GET_DELEGATION_FROM_DF) {
    await replaceActorIdentity(delegationFactory, identity)
    const pk = new Uint8Array(sessionKey.getPublicKey().toDer())
    delegationChain = await getDelegationChainSignedByCanister(
      identity,
      targets,
      pk,
      anchor,
      origin,
    )
  } else {
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
    JSON.stringify({ identity, chain, targets }),
    response,
    { ttl: 600 },
  )

  return response
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
export async function ecdsaGetAnonymous(
  domain: string,
  sessionKey: Uint8Array,
  identity: DelegationIdentity,
  chain = Chain.IC,
  maxTimeToLive = ONE_HOUR_IN_MS * 2,
): Promise<DelegationChain> {
  await replaceActorIdentity(im, identity)
  const account: HTTPAccountResponse = await im.get_account()
  const anchor = account.data[0]?.anchor
  if (anchor && anchor >= ANCHOR_TO_GET_DELEGATION_FROM_DF) {
    await replaceActorIdentity(delegationFactory, identity)
    return await getDelegationChainSignedByCanister(
      identity,
      [],
      sessionKey,
      anchor,
      domain,
    )
  }

  const lambdaPublicKey = await fetchLambdaPublicKey(chain)

  const delegationChainForLambda = await createDelegationChain(
    identity,
    lambdaPublicKey,
    new Date(Date.now() + ONE_MINUTE_IN_MS * 10),
    { previous: identity.getDelegation() },
  )

  const request = {
    chain,
    delegationChain: JSON.stringify(delegationChainForLambda.toJSON()),
    tempPublicKey: lambdaPublicKey,
    domain,
    sessionPublicKey: toHexString(sessionKey),
    delegationTtl: maxTimeToLive,
  }
  const signUrl = ic.isLocal ? `/ecdsa_get_anonymous` : AWS_ECDSA_GET_ANONYMOUS
  return await fetch(signUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  }).then(async (response) => {
    if (!response.ok) throw new Error(await response.text())
    const a = await response.json()
    deleteFromStorage(domain)
    return DelegationChain.fromJSON(a)
  })
}

/**
 * Signs a message using ECDSA.
 * @deprecated
 * @param keccak - The message to sign.
 * @param identity - The users delegation identity.
 * @param chain - The chain to sign on.
 * @param maxTimeToLive - The maximum time to live for the delegation chain.
 * @returns A Promise that resolves to the signature.
 */
export async function ecdsaSign(
  keccak: string,
  identity: DelegationIdentity,
  chain: Chain,
  maxTimeToLive = ONE_HOUR_IN_MS * 2,
): Promise<string> {
  const lambdaPublicKey = await fetchLambdaPublicKey(chain)

  const delegationChainForLambda = await createDelegationChain(
    identity,
    lambdaPublicKey,
    new Date(Date.now() + ONE_MINUTE_IN_MS * 10),
    { previous: identity.getDelegation() },
  )

  const request = {
    chain,
    delegationChain: JSON.stringify(delegationChainForLambda.toJSON()),
    tempPublicKey: lambdaPublicKey,
    keccak,
    delegationTtl: maxTimeToLive,
  }
  const signUrl = ic.isLocal ? `/ecdsa_sign` : AWS_ECDSA_SIGN
  return await fetch(signUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  }).then(async (response) => {
    if (!response.ok) throw new Error(await response.text())
    return await response.json()
  })
}

async function ecdsaRegisterNewKeyPair(
  identity: DelegationIdentity,
  chain: Chain,
): Promise<string> {
  const lambdaPublicKey = await fetchLambdaPublicKey(chain)

  const delegationChainForLambda = await DelegationChain.create(
    identity,
    Ed25519KeyIdentity.fromParsedJson([lambdaPublicKey, "0"]).getPublicKey(),
    new Date(Date.now() + ONE_MINUTE_IN_MS * 10),
    { previous: identity.getDelegation() },
  )
  const request = {
    chain,
    delegationChain: JSON.stringify(delegationChainForLambda.toJSON()),
    tempPublicKey: lambdaPublicKey,
  }

  const registerAddressUrl = AWS_ECDSA_REGISTER_ADDRESS
  // const registerAddressUrl = ic.isLocal
  //   ? `/ecdsa_register_address`
  //   : AWS_ECDSA_REGISTER_ADDRESS

  const response = await fetch(registerAddressUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  }).then(async (response) => {
    if (!response.ok) throw new Error(await response.text())
    return await response.json()
  })
  return response.public_key
}

export async function getPublicKey(
  identity: DelegationIdentity,
  chain = Chain.IC,
  origin = GLOBAL_ORIGIN,
): Promise<string> {
  const cacheKey =
    "ecdsa_getPublicKey" + chain.toString() + identity.getPrincipal().toText()
  const cachedValue = await integrationCache.getItem(cacheKey)
  if (cachedValue) return cachedValue as any
  await replaceActorIdentity(delegationFactory, identity)
  await replaceActorIdentity(im, identity)
  const account: HTTPAccountResponse = await im.get_account()
  const anchor = account.data[0]?.anchor
  if (anchor && anchor >= ANCHOR_TO_GET_DELEGATION_FROM_DF) {
    const principal = await getPrincipalSignedByCanister(anchor, origin)
    return principal.toText()
  }

  const signer = defineChainCanister(chain)
  await replaceActorIdentity(signer, identity)
  const root = await im.get_root_by_principal(
    identity.getPrincipal().toString(),
  )

  if (!root[0]) {
    throw Error("The root account cannot be found.")
  }

  const response = (await signer.get_public_key(root[0])) as string[]
  let publicKey
  if (response.length === 0) {
    publicKey = await ecdsaRegisterNewKeyPair(identity, chain)
  } else {
    publicKey = response[0]
  }
  const publicDelegation = Ed25519KeyIdentity.fromParsedJson([publicKey, "0"])
  const principal = Principal.selfAuthenticating(
    new Uint8Array(publicDelegation.getPublicKey().toDer()),
  )

  await integrationCache.setItem(cacheKey, principal.toText(), {
    ttl: 6000,
  })
  return principal.toText()
}

function defineChainCanister(chain: Chain) {
  switch (chain) {
    case Chain.ETH:
      return ecdsaSigner
    case Chain.BTC:
      return btcSigner
    case Chain.IC:
      return icSigner
  }
}

export async function fetchLambdaPublicKey(chain: Chain): Promise<string> {
  const registerUrl = ic.isLocal ? `/ecdsa_register` : AWS_ECDSA_REGISTER
  const response = await fetch(registerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chain }),
  })

  if (!response.ok) throw new Error(await response.text())
  return (await response.json()).public_key
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

async function fetchSignUrl(request: Record<string, any>): Promise<any> {
  const signUrl = ic.isLocal ? `/ecdsa_sign` : AWS_ECDSA_SIGN
  const response = await fetch(signUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })

  if (!response.ok) throw new Error(await response.text())
  return await response.json()
}

export function toHexString(bytes: ArrayBuffer): string {
  return new Uint8Array(bytes).reduce(
    (str, byte) => str + byte.toString(16).padStart(2, "0"),
    "",
  )
}

async function oldFlowGlobalKeysFromLambda(
  identity: DelegationIdentity,
  targets: string[],
  sessionPublicKey: Uint8Array,
  origin: string,
  maxTimeToLive = ONE_HOUR_IN_MS * 2,
) {
  //we do not support BTC/ETH anymore
  const chain = Chain.IC
  const lambdaPublicKey = await fetchLambdaPublicKey(chain)

  const delegationChainForLambda = await createDelegationChain(
    identity,
    lambdaPublicKey,
    new Date(Date.now() + ONE_MINUTE_IN_MS * 10),
    { previous: identity.getDelegation() },
  )

  const request = {
    chain,
    delegationChain: JSON.stringify(delegationChainForLambda.toJSON()),
    sessionPublicKey: toHexString(sessionPublicKey),
    tempPublicKey: lambdaPublicKey,
    targets,
    maxTimeToLive,
  }

  const delegationJSON = await fetchSignUrl(request)
  return DelegationChain.fromJSON(delegationJSON)
}

async function oldFlowDelegationChainLambda(
  identity: DelegationIdentity,
  sessionKey: Ed25519KeyIdentity,
  targets: string[],
): Promise<DelegationChain> {
  const lambdaPublicKey = await fetchLambdaPublicKey(Chain.IC)
  const delegationChainForLambda = await createDelegationChain(
    identity,
    lambdaPublicKey,
    new Date(Date.now() + ONE_MINUTE_IN_MS * 10),
    { previous: identity.getDelegation() },
  )
  const request = {
    chain: Chain.IC,
    delegationChain: JSON.stringify(delegationChainForLambda.toJSON()),
    sessionPublicKey: sessionKey.toJSON()[0],
    tempPublicKey: lambdaPublicKey,
    targets,
  }
  const chainResponse = await fetchSignUrl(request)

  return DelegationChain.fromJSON(chainResponse)
}

function fromHexString(hexString: string): ArrayBuffer {
  const bytes = new Uint8Array(hexString.length / 2)
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hexString.substr(i, 2), 16)
  }
  return bytes.buffer
}
