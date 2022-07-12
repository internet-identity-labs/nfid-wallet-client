import { ActorSubclass, SignIdentity } from "@dfinity/agent"
import { DerEncodedPublicKey } from "@dfinity/agent"
import { fromHexString } from "@dfinity/candid/lib/cjs/utils/buffer"
import {
  Ed25519KeyIdentity,
  DelegationChain,
  DelegationIdentity,
} from "@dfinity/identity"
import { Principal } from "@dfinity/principal"

import {
  accessList,
  invalidateIdentity,
  replaceIdentity,
} from "frontend/comm/actors"
import { InternetIdentity } from "frontend/comm/actors"
import { ii } from "frontend/comm/actors"
import {
  ChallengeResult,
  PublicKey,
  SessionKey,
  SignedDelegation,
} from "frontend/comm/idl/internet_identity_types"
import {
  Purpose,
  UserNumber,
  KeyType,
  Challenge,
} from "frontend/comm/idl/internet_identity_types"
import { IIConnection } from "frontend/comm/services/internet-identity/iiConnection"
import { hasOwnProperty } from "frontend/comm/services/internet-identity/utils"

interface FrontendDelegation {
  delegationIdentity: DelegationIdentity
  chain: DelegationChain
  sessionKey: Ed25519KeyIdentity
}

export interface JSONSerialisableSignedDelegation {
  delegation: {
    pubkey: PublicKey
    expiration: string
    targets: undefined
  }
  signature: number[]
  userKey: PublicKey
}

function authStateClosure() {
  let _identity: SignIdentity
  let _delegationIdentity: DelegationIdentity
  let _actor: ActorSubclass<InternetIdentity> | undefined
  return {
    setIdentity: (identity: SignIdentity) => (_identity = identity),
    setDelegationIdentity: (_delegationIdentity: DelegationIdentity) => {},
    setActor: (actor: ActorSubclass<InternetIdentity>) => {},
    get: () => ({
      identity: _identity,
      delegationIdentity: _delegationIdentity,
      actor: _actor,
    }),
  }
}

export const authState = authStateClosure()

const ONE_MINUTE_IN_M_SEC = 60 * 1000
const TEN_MINUTES_IN_M_SEC = 10 * ONE_MINUTE_IN_M_SEC

export async function createChallenge(): Promise<Challenge> {
  const challenge = await ii.create_challenge()
  return challenge
}

export async function fetchAllDevices(anchor: UserNumber) {
  return await ii.lookup(anchor)
}

export async function fetchAuthenticatorDevices(
  anchor: UserNumber,
  withSecurityDevices?: boolean,
) {
  const allDevices = await ii.lookup(anchor)

  return allDevices.filter((device) =>
    withSecurityDevices
      ? true
      : hasOwnProperty(device.purpose, "authentication"),
  )
}

export async function fetchRecoveryDevices(anchor: UserNumber) {
  const allDevices = await ii.lookup(anchor)
  return allDevices.filter((device) =>
    hasOwnProperty(device.purpose, "recovery"),
  )
}

export const requestFEDelegationChain = async (
  identity: SignIdentity,
  ttl: number = TEN_MINUTES_IN_M_SEC,
) => {
  const sessionKey = Ed25519KeyIdentity.generate()
  // Here the security device is used. Besides creating new keys, this is the only place.
  const chain = await DelegationChain.create(
    identity,
    sessionKey.getPublicKey(),
    new Date(Date.now() + ttl),
    {
      targets: accessList.map((x) => Principal.fromText(x)),
    },
  )

  return { chain, sessionKey }
}

export const requestFEDelegation = async (
  identity: SignIdentity,
): Promise<FrontendDelegation> => {
  const { sessionKey, chain } = await requestFEDelegationChain(identity)

  return {
    delegationIdentity: DelegationIdentity.fromDelegation(sessionKey, chain),
    chain,
    sessionKey,
  }
}

export async function renewDelegation() {
  const { delegationIdentity, actor, identity } = authState.get()

  for (const { delegation } of delegationIdentity.getDelegation().delegations) {
    // prettier-ignore
    if (+new Date(Number(delegation.expiration / BigInt(1000000))) <= +Date.now()) {
        invalidateIdentity();
        break;
      }
  }

  if (actor === undefined) {
    // Create our actor with a DelegationIdentity to avoid re-prompting auth

    authState.setDelegationIdentity(
      (await requestFEDelegation(identity)).delegationIdentity,
    )
    replaceIdentity(delegationIdentity)
  }
}

/**
 * @deprecated: no need to use the session key as secret
 *
 * @export
 * @param {string} secret
 * @return {*}
 */
export function getSessionKey(secret: string) {
  const blobReverse = fromHexString(secret)
  const sessionKey = Array.from(new Uint8Array(blobReverse))
  return sessionKey
}

async function prepareDelegation(
  userNumber: UserNumber,
  hostname: FrontendHostname,
  sessionKey: SessionKey,
  maxTimeToLive?: bigint,
): Promise<[PublicKey, bigint]> {
  console.log(
    `prepare_delegation(user: ${userNumber}, hostname: ${hostname}, session_key: ${sessionKey})`,
  )
  await renewDelegation()
  return await ii.prepare_delegation(
    userNumber,
    hostname,
    sessionKey,
    maxTimeToLive !== undefined ? [maxTimeToLive] : [],
  )
}

const retryGetDelegation = async (
  userNumber: bigint,
  hostname: string,
  sessionKey: PublicKey,
  timestamp: bigint,
  maxRetries = 5,
): Promise<SignedDelegation> => {
  for (let i = 0; i < maxRetries; i++) {
    // Linear backoff
    await new Promise((resolve) => {
      setInterval(resolve, 1000 * i)
    })
    const res = await getDelegation(userNumber, hostname, sessionKey, timestamp)
    if (hasOwnProperty(res, "signed_delegation")) {
      return res.signed_delegation
    }
  }
  throw new Error(
    `Failed to retrieve a delegation after ${maxRetries} retries.`,
  )
}

export async function getDelegation(
  userNumber: UserNumber,
  hostname: FrontendHostname,
  sessionKey: SessionKey,
  timestamp: Timestamp,
): Promise<GetDelegationResponse> {
  console.log(
    `get_delegation(user: ${userNumber}, hostname: ${hostname}, session_key: ${sessionKey}, timestamp: ${timestamp})`,
  )
  await renewDelegation()
  return await ii.get_delegation(userNumber, hostname, sessionKey, timestamp)
}

/**
 * fetches the third party delegation
 *
 * @export
 * @param {bigint} anchor
 * @param {string} scope
 * @param {SessionKey} sessionKey
 * @return {*}
 */
export async function fetchDelegation(
  anchor: bigint,
  scope: string,
  sessionKey: SessionKey,
): Promise<[PublicKey, SignedDelegation]> {
  const prepRes = await prepareDelegation(anchor, scope, sessionKey)
  // TODO: move to error handler
  if (prepRes.length !== 2) {
    throw new Error(
      `Error preparing the delegation. Result received: ${prepRes}`,
    )
  }
  const [userKey, timestamp] = prepRes

  const signedDelegation = await retryGetDelegation(
    anchor,
    scope,
    sessionKey,
    timestamp,
  )
  return [userKey, signedDelegation]
}

/**
 * Builds a json serializable SignedDelegation to send
 * over the pubsub channel
 *
 * @export
 * @param {PublicKey} publicKey
 * @param {SignedDelegation} signedDelegation
 * @return {*}
 */
export function buildSerializableSignedDelegation(
  publicKey: PublicKey,
  signedDelegation: SignedDelegation,
): JSONSerialisableSignedDelegation {
  return {
    delegation: {
      pubkey: signedDelegation.delegation.pubkey,
      expiration: signedDelegation.delegation.expiration.toString(),
      targets: undefined,
    },
    signature: signedDelegation.signature,
    userKey: publicKey,
  }
}

export function getDelegationFromJson(
  chain: string,
  sessionKey: string,
): [DelegationChain, Ed25519KeyIdentity] {
  return [
    DelegationChain.fromJSON(chain),
    Ed25519KeyIdentity.fromJSON(sessionKey),
  ]
}

export async function addDevice(
  anchor: UserNumber,
  alias: string,
  keyType: KeyType,
  purpose: Purpose,
  newPublicKey: DerEncodedPublicKey,
  credentialId?: ArrayBuffer,
) {
  await renewDelegation()
  return await ii.add(anchor, {
    alias,
    pubkey: Array.from(new Uint8Array(newPublicKey)),
    credential_id: credentialId
      ? [Array.from(new Uint8Array(credentialId))]
      : [],
    key_type: keyType,
    purpose,
    protection: { unprotected: null },
  })
}

export async function removeDevice(
  userNumber: UserNumber,
  publicKey: PublicKey,
): Promise<void> {
  await renewDelegation()
  await ii.remove(userNumber, publicKey)
}

export async function registerAnchor(
  alias: string,
  challengeResult: ChallengeResult,
  pubkey: number[],
  credentialId?: number[],
) {
  return await ii.register(
    {
      alias,
      pubkey,
      credential_id: credentialId ? [credentialId] : [],
      key_type: { unknown: null },
      purpose: { authentication: null },
      protection: { unprotected: null },
    },
    challengeResult,
  )
}
