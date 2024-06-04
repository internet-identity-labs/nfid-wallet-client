import { DerEncodedPublicKey, PublicKey } from "@dfinity/agent"
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { hexStringToUint8Array } from "@dfinity/utils"

import { ONE_HOUR_IN_MS, ONE_MINUTE_IN_MS } from "@nfid/config"

import { integrationCache } from "../../cache"
import {
  btcSigner,
  ecdsaSigner,
  icSigner,
  im,
  replaceActorIdentity,
} from "../actors"
import { ic } from "../agent/index"
import { authStorage } from "../authentication/storage"
import {
  deleteFromStorage,
  getFromStorage,
  saveToStorage,
} from "./domain-key-repository"
import { validateTargets } from "./targets"
import { decrypt, encrypt } from "./util"

const HOUR = 3_600_000

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
  await replaceActorIdentity(icSigner, identity)
  if (targets.length === 0) {
    throw new Error("Define targets")
  }
  await validateTargets(targets, origin)
  const defaultExpirationInMinutes = 120
  const delegationJSON = await getDelegationChain(
    toHexString(sessionPublicKey),
    targets,
    identity,
    maxTimeToLive,
  )
  saveToStorage(
    origin,
    toHexString(sessionPublicKey),
    defaultExpirationInMinutes,
  )
  return DelegationChain.fromJSON(delegationJSON)
}

export async function getGlobalKeys(
  identity: DelegationIdentity,
  chain: Chain,
  targets: string[],
): Promise<DelegationIdentity> {
  const cachedValue = await integrationCache.getItem(
    JSON.stringify({ identity, chain, targets }),
  )
  await replaceActorIdentity(icSigner, identity)
  if (cachedValue) return cachedValue as any
  const sessionKey = Ed25519KeyIdentity.generate()
  const delegationJSON = await getDelegationChain(
    sessionKey.toJSON()[0],
    targets,
    identity,
  )
  const response = DelegationIdentity.fromDelegation(
    sessionKey,
    DelegationChain.fromJSON(delegationJSON),
  )
  await integrationCache.setItem(
    JSON.stringify({ identity, chain, targets }),
    response,
    { ttl: 600 },
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

/**
 * Signs a message using ECDSA.
 *
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
  chain: Chain,
  maxTimeToLive = ONE_HOUR_IN_MS * 2,
): Promise<DelegationChain> {
  await replaceActorIdentity(im, identity)
  const principal = await im.get_root_by_principal(
    identity.getPrincipal().toString(),
  )
  const hex = await getAnonEncryptionKey(identity, domain)
  const seed = hexStringToUint8Array(hex)
  const generatedIdentity = Ed25519KeyIdentity.generate(seed)
  const key: PublicKey = new DerPublicKey(sessionKey)
  const delegationChain = await DelegationChain.create(
    generatedIdentity,
    key,
    new Date(Date.now() + maxTimeToLive),
  )
  const a = JSON.stringify(delegationChain.toJSON())
  deleteFromStorage(domain)
  return DelegationChain.fromJSON(a)
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
  await replaceActorIdentity(im, identity)
  const root = await im.get_root_by_principal(
    identity.getPrincipal().toString(),
  )
  if (!root[0]) {
    throw Error("The root account cannot be found.")
  }
  const response = (await signer.get_public_key(root[0])) as string[]
  let publicKey
  if (response.length === 0) {
    const kp = await registerNewKeyPair(identity)
    publicKey = kp.publicKey
  } else {
    publicKey = response[0]
  }
  await integrationCache.setItem(cacheKey, publicKey, {
    ttl: 6000,
  })
  return publicKey
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

export function toHexString(bytes: ArrayBuffer): string {
  return new Uint8Array(bytes).reduce(
    (str, byte) => str + byte.toString(16).padStart(2, "0"),
    "",
  )
}

function fromHexString(hexString: string): ArrayBuffer {
  const bytes = new Uint8Array(hexString.length / 2)
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hexString.substr(i, 2), 16)
  }
  return bytes.buffer
}

async function getDelegationChain(
  publicSessionKey: string,
  targets: string[],
  delegationIdentity: DelegationIdentity,
  delegationTtl?: number,
) {
  const canisterKeyPairResponse = await icSigner.get_kp()
  let publicKey
  let privateKey
  if (canisterKeyPairResponse.key_pair.length === 0) {
    const ecdsaKeyPair = await registerNewKeyPair(delegationIdentity)
    publicKey = ecdsaKeyPair.publicKey
    privateKey = ecdsaKeyPair.privateKey
  } else {
    privateKey = decrypt(
      canisterKeyPairResponse.key_pair[0]!.private_key_encrypted,
      "utf8",
      await getEncryptionKey2(delegationIdentity),
    )
    publicKey = canisterKeyPairResponse.key_pair[0]!.public_key
  }

  const identity = Ed25519KeyIdentity.fromParsedJson([publicKey, privateKey])
  let key
  try {
    const bytes = fromHexString(publicSessionKey)
    key = new DerPublicKey(new Uint8Array(bytes))
  } catch (e) {
    throw new Error("DerPublicKey is invalid")
  }
  if (!key) {
    throw new Error("Invalid key")
  }
  const ttl = delegationTtl ?? 2 * HOUR
  const chain = await DelegationChain.create(
    identity,
    key,
    new Date(Date.now() + ttl),
    {
      targets: targets.map((x) => Principal.fromText(x)),
    },
  )
  return JSON.stringify(chain.toJSON())
}

export class DerPublicKey implements PublicKey {
  der

  constructor(a: any) {
    this.der = a
  }

  toDer(): DerEncodedPublicKey {
    return this.der
  }
}

async function getAnonEncryptionKey(
  identity: DelegationIdentity,
  domain: string,
) {
  const key = await authStorage.get("ANONYMOUS_" + domain)
  if (key !== null) {
    return key
  }
  const lambdaPublicKey = await fetchLambdaPublicKey(Chain.IC)

  const delegationChainForLambda = await createDelegationChain(
    identity,
    lambdaPublicKey,
    new Date(Date.now() + ONE_MINUTE_IN_MS * 10),
    { previous: identity.getDelegation() },
  )

  const request = {
    domain,
    delegationChain: JSON.stringify(delegationChainForLambda.toJSON()),
    tempPublicKey: lambdaPublicKey,
  }
  const res = await fetchAnonKey(request)
  await authStorage.set("ANONYMOUS_" + domain, res)
  return res
}

async function fetchAnonKey(request: Record<string, any>): Promise<any> {
  const signUrl = ic.isLocal
    ? `/ecdsa_get_anonymous_seed`
    : AWS_ECDSA_GET_ANONYMOUS_SEED
  const response = await fetch(signUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })

  if (!response.ok) throw new Error(await response.text())
  return await response.json()
}

async function getEncryptionKey2(identity: DelegationIdentity) {
  // authStorage.set()

  const lambdaPublicKey = await fetchLambdaPublicKey(Chain.IC)

  const delegationChainForLambda = await createDelegationChain(
    identity,
    lambdaPublicKey,
    new Date(Date.now() + ONE_MINUTE_IN_MS * 10),
    { previous: identity.getDelegation() },
  )

  const request = {
    delegationChain: JSON.stringify(delegationChainForLambda.toJSON()),
    tempPublicKey: lambdaPublicKey,
  }

  const res = await fetchECDSAKey(request)
  return res
}

async function fetchECDSAKey(request: Record<string, any>): Promise<any> {
  const signUrl = ic.isLocal
    ? `/ecdsa_encryption_key`
    : AWS_ECDSA_ENCRYPTION_KEY
  const response = await fetch(signUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })

  if (!response.ok) throw new Error(await response.text())
  return await response.json()
}

async function registerNewKeyPair(delegationIdentity: DelegationIdentity) {
  const keyPair = Ed25519KeyIdentity.generate()
  const ecdsaKeyPair = {
    privateKey: keyPair.toJSON()[1],
    publicKey: keyPair.toJSON()[0],
  }
  //even if there is no KP - canister returns root principal of the related account
  const encryptedPrivateKey = encrypt(
    ecdsaKeyPair.privateKey,
    "utf8",
    await getEncryptionKey2(delegationIdentity),
  )
  const encryptedKeyPair = {
    public_key: ecdsaKeyPair.publicKey,
    private_key_encrypted: encryptedPrivateKey,
  }
  try {
    await icSigner.add_kp(encryptedKeyPair)
  } catch (e: any) {
    if (e.message.includes("Already registered")) {
      console.warn("Already registered keypair:", e)
      return ecdsaKeyPair
    }

    throw Error(e)
  }

  return ecdsaKeyPair
}
