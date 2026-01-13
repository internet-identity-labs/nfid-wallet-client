import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import { Principal } from "@dfinity/principal"

import { ONE_HOUR_IN_MS, ONE_MINUTE_IN_MS } from "@nfid/config"
import {
  createDelegationChain,
  DelegationType,
  getAnonymousDelegate,
  GLOBAL_ORIGIN,
  ic,
  icSigner,
  replaceActorIdentity,
  toHexString,
} from "@nfid/integration"

import { deleteFromStorage } from "./domain-key-repository"

export enum Chain {
  IC = "IC",
}

export async function getAnonymousDelegationThroughLambda(
  domain: string,
  sessionKey: Uint8Array,
  identity: DelegationIdentity,
  maxTimeToLive = ONE_HOUR_IN_MS * 2,
) {
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
    tempPublicKey: lambdaPublicKey,
    domain,
    sessionPublicKey: toHexString(new Uint8Array(sessionKey).buffer),
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
    await deleteFromStorage(domain)
    return DelegationChain.fromJSON(a)
  })
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

export async function oldFlowGlobalKeysFromLambda(
  identity: DelegationIdentity,
  targets: string[],
  sessionPublicKey: Uint8Array,
  origin: string,
  maxTimeToLive = ONE_HOUR_IN_MS * 2,
) {
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
    sessionPublicKey: toHexString(new Uint8Array(sessionPublicKey).buffer),
    tempPublicKey: lambdaPublicKey,
    targets,
    delegationTtl: maxTimeToLive,
  }

  const delegationJSON = await fetchSignUrl(request)
  return DelegationChain.fromJSON(delegationJSON)
}

export async function ecdsaRegisterNewKeyPair(
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

export async function getLambdaPublicKey(
  identity: DelegationIdentity,
  origin = GLOBAL_ORIGIN,
  type = DelegationType.GLOBAL,
  root: string | undefined,
) {
  if (type === DelegationType.GLOBAL) {
    const signer = icSigner
    await replaceActorIdentity(signer, identity)

    if (!root) {
      throw Error("The root account cannot be found.")
    }

    const response = (await signer.get_public_key(root)) as string[]
    let publicKey
    if (response.length === 0) {
      publicKey = await ecdsaRegisterNewKeyPair(identity, Chain.IC)
    } else {
      publicKey = response[0]
    }
    const publicDelegation = Ed25519KeyIdentity.fromParsedJson([publicKey, "0"])
    const principal = Principal.selfAuthenticating(
      new Uint8Array(publicDelegation.getPublicKey().toDer()),
    )

    return principal.toText()
  } else {
    const sessionKey = Ed25519KeyIdentity.generate()

    const anonymousDelegation = await getAnonymousDelegate(
      Array.from(new Uint8Array(sessionKey.getPublicKey().toDer())) as any,
      identity,
      origin,
      undefined,
    )

    return Principal.selfAuthenticating(
      new Uint8Array(anonymousDelegation.publicKey),
    ).toText()
  }
}

export async function oldFlowDelegationChainLambda(
  identity: DelegationIdentity,
  sessionKey: Ed25519KeyIdentity,
  targets: string[],
): Promise<DelegationChain> {
  const lambdaPublicKey = await fetchLambdaPublicKey(Chain.IC)
  const delegationChainForLambda = await createDelegationChain(
    identity,
    lambdaPublicKey,
    new Date(Date.now() + ONE_HOUR_IN_MS * 2),
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

export function fromHexString(hexString: string): ArrayBuffer {
  const bytes = new Uint8Array(hexString.length / 2)
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hexString.substr(i, 2), 16)
  }
  return bytes.buffer
}

export async function fetchSignUrl(request: Record<string, any>): Promise<any> {
  const signUrl = ic.isLocal ? `/ecdsa_sign` : AWS_ECDSA_SIGN
  const response = await fetch(signUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })

  if (!response.ok) throw new Error(await response.text())
  return await response.json()
}
