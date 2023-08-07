import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"

import { ONE_MINUTE_IN_MS } from "@nfid/config"

import { integrationCache } from "../../cache"
import { btcSigner, ecdsaSigner, replaceActorIdentity } from "../actors"
import { ic } from "../agent/index"

export enum Chain {
  BTC = "BTC",
  ETH = "ETH",
  IC = "IC",
}

/**
 * Returns an hexadecimal representation of an array buffer.
 * @param bytes The array buffer.
 */
export function toHexString(bytes: ArrayBuffer): string {
  return new Uint8Array(bytes).reduce(
    (str, byte) => str + byte.toString(16).padStart(2, "0"),
    "",
  )
}

export async function getGlobalKeys(
  identity: DelegationIdentity,
  chain: Chain,
  targets: string[],
): Promise<DelegationIdentity> {
  const cachedValue = await integrationCache.getItem(
    JSON.stringify({ identity, chain, targets }),
  )
  if (cachedValue) return cachedValue as any

  const registerUrl = ic.isLocal ? `/ecdsa_register` : AWS_ECDSA_REGISTER
  const lambdaPublicKey = await fetch(registerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chain,
    }),
  }).then(async (response) => {
    if (!response.ok) throw new Error(await response.text())
    return (await response.json()).public_key
  })

  const delegationChainForLambda = await DelegationChain.create(
    identity,
    Ed25519KeyIdentity.fromParsedJson([lambdaPublicKey, ""]).getPublicKey(),
    new Date(Date.now() + ONE_MINUTE_IN_MS * 10),
    { previous: identity.getDelegation() },
  )

  const sessionKey = Ed25519KeyIdentity.generate()
  const request = {
    chain,
    delegationChain: JSON.stringify(delegationChainForLambda.toJSON()),
    sessionPublicKey: sessionKey.toJSON()[0],
    tempPublicKey: lambdaPublicKey,
    targets,
  }
  const signUrl = ic.isLocal ? `/ecdsa_sign` : AWS_ECDSA_SIGN
  const chainResponse = await fetch(signUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  }).then(async (response) => {
    if (!response.ok) throw new Error(await response.text())
    return await response.json()
  })
  const response = DelegationIdentity.fromDelegation(
    sessionKey,
    DelegationChain.fromJSON(chainResponse),
  )

  integrationCache.setItem(
    JSON.stringify({ identity, chain, targets }),
    response,
    { ttl: 600 },
  )

  return response
}

export async function ecdsaSign(
  keccak: string,
  identity: DelegationIdentity,
  chain: Chain,
): Promise<string> {
  const registerUrl = ic.isLocal ? `/ecdsa_register` : AWS_ECDSA_REGISTER
  const lambdaPublicKey = await fetch(registerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chain,
    }),
  }).then(async (response) => {
    if (!response.ok) throw new Error(await response.text())
    return (await response.json()).public_key
  })
  const delegationChainForLambda = await DelegationChain.create(
    identity,
    Ed25519KeyIdentity.fromParsedJson([lambdaPublicKey, ""]).getPublicKey(),
    new Date(Date.now() + ONE_MINUTE_IN_MS * 10),
    { previous: identity.getDelegation() },
  )
  const request = {
    chain,
    delegationChain: JSON.stringify(delegationChainForLambda.toJSON()),
    tempPublicKey: lambdaPublicKey,
    keccak,
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

export async function ecdsaGetAnonymous(
  domain: string,
  sessionKey: Uint8Array,
  identity: DelegationIdentity,
  chain: Chain,
): Promise<DelegationChain> {
  const registerUrl = ic.isLocal ? `/ecdsa_register` : AWS_ECDSA_REGISTER
  const lambdaPublicKey = await fetch(registerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chain,
    }),
  }).then(async (response) => {
    if (!response.ok) throw new Error(await response.text())
    return (await response.json()).public_key
  })
  const delegationChainForLambda = await DelegationChain.create(
    identity,
    Ed25519KeyIdentity.fromParsedJson([lambdaPublicKey, ""]).getPublicKey(),
    new Date(Date.now() + ONE_MINUTE_IN_MS * 10),
    { previous: identity.getDelegation() },
  )
  const request = {
    chain,
    delegationChain: JSON.stringify(delegationChainForLambda.toJSON()),
    tempPublicKey: lambdaPublicKey,
    domain,
    sessionPublicKey: toHexString(sessionKey),
  }
  const signUrl = ic.isLocal ? `/ecdsa_get_anonymous` : AWS_ECDSA_GET_ANONYMOUS
  return await fetch(signUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  }).then(async (response) => {
    if (!response.ok) throw new Error(await response.text())
    const a = await response.json()
    console.log(a)
    return DelegationChain.fromJSON(a)
  })
}

export async function ecdsaRegisterNewKeyPair(
  identity: DelegationIdentity,
  chain: Chain,
): Promise<string> {
  const registerUrl = ic.isLocal ? `/ecdsa_register` : AWS_ECDSA_REGISTER
  const lambdaPublicKey = await fetch(registerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chain,
    }),
  }).then(async (response) => {
    if (!response.ok) throw new Error(await response.text())
    return (await response.json()).public_key
  })
  const delegationChainForLambda = await DelegationChain.create(
    identity,
    Ed25519KeyIdentity.fromParsedJson([lambdaPublicKey, ""]).getPublicKey(),
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
  chain: Chain,
): Promise<string> {
  const cacheKey =
    "ecdsa_getPublicKey" + chain.toString() + identity.getPrincipal().toText()
  const cachedValue = await integrationCache.getItem(cacheKey)
  if (cachedValue) return cachedValue as any
  const signer = defineChainCanister(chain)
  await replaceActorIdentity(signer, identity)
  let response = await signer.get_kp()
  if (response.key_pair.length === 0) {
    await ecdsaRegisterNewKeyPair(identity, chain)
    response = await signer.get_kp()
    if (response.key_pair.length === 0) {
      throw "Unable to preregister keys"
    }
  }
  await integrationCache.setItem(cacheKey, response.key_pair[0].public_key, {
    ttl: 6000,
  })
  return response.key_pair[0].public_key
}

function defineChainCanister(chain: Chain) {
  switch (chain) {
    case Chain.ETH:
      return ecdsaSigner
    case Chain.BTC:
      return btcSigner
    case Chain.IC:
      throw Error("Deprecated")
  }
}
