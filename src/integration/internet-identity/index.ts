import { ActorSubclass, SignIdentity } from "@dfinity/agent"
import { DerEncodedPublicKey } from "@dfinity/agent"
import { fromHexString } from "@dfinity/candid/lib/cjs/utils/buffer"
import {
  Ed25519KeyIdentity,
  DelegationChain,
  DelegationIdentity,
  WebAuthnIdentity,
} from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { Buffer } from "buffer"
import { arrayBufferEqual } from "ictool/dist/bits"
import * as tweetnacl from "tweetnacl"

import {
  ChallengeResult,
  DeviceData,
  PublicKey,
  SessionKey,
  SignedDelegation,
  Purpose,
  UserNumber,
  KeyType,
  CredentialId,
  FrontendHostname,
  Timestamp,
  GetDelegationResponse,
  Challenge,
  RegisterResponse,
} from "frontend/integration/_ic_api/internet_identity_types"
import {
  accessList,
  invalidateIdentity,
  replaceIdentity,
} from "frontend/integration/actors"
import { InternetIdentity } from "frontend/integration/actors"
import { ii } from "frontend/integration/actors"
import { fromMnemonicWithoutValidation } from "frontend/integration/internet-identity/crypto/ed25519"

import { MultiWebAuthnIdentity } from "./multiWebAuthnIdentity"
import { derFromPubkey, hasOwnProperty } from "./utils"

export type ApiResult = LoginResult | RegisterResult
export type LoginResult =
  | LoginSuccess
  | UnknownUser
  | AuthFail
  | ApiError
  | SeedPhraseFail
export type RegisterResult =
  | LoginSuccess
  | AuthFail
  | ApiError
  | RegisterNoSpace
  | BadChallenge

type LoginSuccess = {
  kind: "loginSuccess"
  chain: DelegationChain
  sessionKey: Ed25519KeyIdentity
  userNumber: bigint
}

type BadChallenge = { kind: "badChallenge" }
type UnknownUser = { kind: "unknownUser"; userNumber: bigint }
type AuthFail = { kind: "authFail"; error: Error }
type ApiError = { kind: "apiError"; error: Error }
type RegisterNoSpace = { kind: "registerNoSpace" }
type SeedPhraseFail = { kind: "seedPhraseFail" }

export type { ChallengeResult } from "frontend/integration/_ic_api/internet_identity_types"

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
  let _identity: SignIdentity | undefined
  let _delegationIdentity: DelegationIdentity | undefined
  let _actor: ActorSubclass<InternetIdentity> | undefined
  return {
    setDelegationIdentity(delegationIdentity: DelegationIdentity) {
      _delegationIdentity = delegationIdentity
    },
    set(
      identity: SignIdentity,
      delegationIdentity: DelegationIdentity,
      actor: ActorSubclass<InternetIdentity>,
    ) {
      _actor = actor
      _identity = identity
      _delegationIdentity = delegationIdentity
      replaceIdentity(delegationIdentity)
    },
    get: () => ({
      identity: _identity,
      delegationIdentity: _delegationIdentity,
      actor: _actor,
    }),
    reset() {
      _identity = undefined
      _delegationIdentity = undefined
      _actor = undefined
    },
  }
}

export const authState = authStateClosure()

const ONE_MINUTE_IN_M_SEC = 60 * 1000
const TEN_MINUTES_IN_M_SEC = 10 * ONE_MINUTE_IN_M_SEC
export const IC_DERIVATION_PATH = [44, 223, 0, 0, 0]

export async function createChallenge(): Promise<Challenge> {
  const challenge = await ii.create_challenge()
  return challenge
}

// The options sent to the browser when creating the credentials.
// Credentials (key pair) creation is signed with a private key that is unique per device
// model, as an "attestation" that the credentials were created with a FIDO
// device. In II we discard this attestation because we only care about the key
// pair that was created and that we use later. Discarding the attestation
// means we do not have to care about attestation checking security concerns
// like setting a server-generated, random challenge.
//
// Algorithm -7, ECDSA_WITH_SHA256, is specified. The reason is that the
// generated (ECDSA) key pair is used later directly to sign messages to the
// IC -- the "assertion" -- so we must use a signing algorithm supported by the
// IC:
//  * https://smartcontracts.org/docs/interface-spec/index.html#signatures
//
// For more information on attestation vs assertion (credentials.create vs
// credentials.get), see
//  * https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API/Attestation_and_Assertion
export const creationOptions = (
  exclude: DeviceData[] = [],
  authenticatorAttachment: AuthenticatorAttachment = "platform",
): PublicKeyCredentialCreationOptions => {
  return {
    authenticatorSelection: {
      userVerification: "preferred",
      authenticatorAttachment,
    },
    excludeCredentials: exclude.flatMap((device) =>
      device.credential_id.length === 0
        ? []
        : {
            id: new Uint8Array(device.credential_id[0]),
            type: "public-key",
          },
    ),
    challenge: Uint8Array.from("<ic0.app>", (c) => c.charCodeAt(0)),
    pubKeyCredParams: [
      {
        type: "public-key",
        // alg: PubKeyCoseAlgo.ECDSA_WITH_SHA256
        alg: -7,
      },
      {
        type: "public-key",
        // alg: PubKeyCoseAlgo.RSA_WITH_SHA256
        alg: -257,
      },
    ],
    rp: {
      name: "Internet Identity Service",
    },
    user: {
      id: tweetnacl.randomBytes(16),
      name: "Internet Identity",
      displayName: "Internet Identity",
    },
  }
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

const requestFEDelegationChain = async (
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

const requestFEDelegation = async (
  identity: SignIdentity,
): Promise<FrontendDelegation> => {
  const { sessionKey, chain } = await requestFEDelegationChain(identity)

  return {
    delegationIdentity: DelegationIdentity.fromDelegation(sessionKey, chain),
    chain,
    sessionKey,
  }
}

async function renewDelegation() {
  const { delegationIdentity, actor, identity } = authState.get()
  if (!delegationIdentity || !identity) throw new Error("unauthorized")

  for (const { delegation } of delegationIdentity.getDelegation().delegations) {
    // prettier-ignore
    if (+new Date(Number(delegation.expiration / BigInt(1000000))) <= +Date.now()) {
        invalidateIdentity();
        break;
      }
  }

  if (actor === undefined) {
    // Create our actor with a DelegationIdentity to avoid re-prompting auth

    authState.set(
      identity,
      (await requestFEDelegation(identity)).delegationIdentity,
      ii,
    )
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

/**
 *
 *
 * @export
 * @param {UserNumber} userNumber
 * @param {FrontendHostname} hostname
 * @param {SessionKey} sessionKey
 * @param {Timestamp} timestamp
 * @return {*}  {Promise<GetDelegationResponse>}
 */
async function getDelegation(
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

async function registerAnchor(
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

async function getPrincipal(
  userNumber: UserNumber,
  frontend: FrontendHostname,
): Promise<Principal> {
  await renewDelegation()
  return await ii.get_principal(userNumber, frontend)
}

const getMultiIdent = (
  devices: DeviceData[],
  withSecurityDevices?: boolean,
) => {
  return MultiWebAuthnIdentity.fromCredentials(
    devices.flatMap((device) =>
      device.credential_id.map((credentialId: CredentialId) => ({
        pubkey: derFromPubkey(device.pubkey),
        credentialId: Buffer.from(credentialId),
      })),
    ),
    withSecurityDevices,
  )
}

export async function register(
  identity: WebAuthnIdentity,
  alias: string,
  challengeResult: ChallengeResult,
): Promise<RegisterResult> {
  let delegation: FrontendDelegation
  try {
    delegation = await requestFEDelegation(identity)
  } catch (error: unknown) {
    console.error(`Error when requesting delegation`, error)
    if (error instanceof Error) {
      return { kind: "authFail", error }
    } else {
      return {
        kind: "authFail",
        error: new Error("Unknown error when requesting delegation"),
      }
    }
  }

  const credential_id = Array.from(new Uint8Array(identity.rawId))
  const pubkey = Array.from(new Uint8Array(identity.getPublicKey().toDer()))

  authState.set(identity, delegation.delegationIdentity, ii)

  let registerResponse: RegisterResponse
  try {
    registerResponse = await registerAnchor(
      alias,
      challengeResult,
      pubkey,
      credential_id,
    )
  } catch (error: unknown) {
    console.error(`Error when registering`, error)
    if (error instanceof Error) {
      return { kind: "apiError", error }
    } else {
      return {
        kind: "apiError",
        error: new Error("Unknown error when registering"),
      }
    }
  }

  if (hasOwnProperty(registerResponse, "canister_full")) {
    return { kind: "registerNoSpace" }
  } else if (hasOwnProperty(registerResponse, "registered")) {
    const userNumber = registerResponse["registered"].user_number
    console.log(`registered Identity Anchor ${userNumber}`)
    authState.set(identity, delegation.delegationIdentity, ii)
    return {
      kind: "loginSuccess",
      chain: delegation.chain,
      sessionKey: delegation.sessionKey,
      userNumber,
    }
  } else if (hasOwnProperty(registerResponse, "bad_challenge")) {
    return { kind: "badChallenge" }
  } else {
    console.error("unexpected register response", registerResponse)
    throw Error("unexpected register response")
  }
}

export async function registerFromGoogle(
  jsonIdentity: string,
  alias: string,
  challengeResult: ChallengeResult,
): Promise<RegisterResult> {
  const identity = Ed25519KeyIdentity.fromJSON(jsonIdentity)

  let delegation: FrontendDelegation
  try {
    delegation = await requestFEDelegation(identity)
  } catch (error: unknown) {
    console.error(`Error when requesting delegation`, error)
    if (error instanceof Error) {
      return { kind: "authFail", error }
    } else {
      return {
        kind: "authFail",
        error: new Error("Unknown error when requesting delegation"),
      }
    }
  }

  const pubkey = Array.from(new Uint8Array(identity.getPublicKey().toDer()))

  replaceIdentity(delegation.delegationIdentity)

  let registerResponse: RegisterResponse
  try {
    registerResponse = await registerAnchor(alias, challengeResult, pubkey)
  } catch (error: unknown) {
    console.error(`Error when registering`, error)
    if (error instanceof Error) {
      return { kind: "apiError", error }
    } else {
      return {
        kind: "apiError",
        error: new Error("Unknown error when registering"),
      }
    }
  }

  if (hasOwnProperty(registerResponse, "canister_full")) {
    return { kind: "registerNoSpace" }
  } else if (hasOwnProperty(registerResponse, "registered")) {
    const userNumber = registerResponse["registered"].user_number
    console.log(`registered Identity Anchor ${userNumber}`)
    replaceIdentity(delegation.delegationIdentity)
    return {
      kind: "loginSuccess",
      chain: delegation.chain,
      sessionKey: delegation.sessionKey,
      userNumber,
    }
  } else if (hasOwnProperty(registerResponse, "bad_challenge")) {
    return { kind: "badChallenge" }
  } else {
    console.error("unexpected register response", registerResponse)
    throw Error("unexpected register response")
  }
}

export async function login(
  userNumber: bigint,
  withSecurityDevices?: boolean,
): Promise<LoginResult> {
  let devices: DeviceData[]
  try {
    devices = await fetchAuthenticatorDevices(userNumber, withSecurityDevices)
  } catch (e: unknown) {
    console.error(`Error when looking up authenticators`, e)
    if (e instanceof Error) {
      return { kind: "apiError", error: e }
    } else {
      return {
        kind: "apiError",
        error: new Error("Unknown error when looking up authenticators"),
      }
    }
  }

  if (devices.length === 0) {
    return { kind: "unknownUser", userNumber }
  }

  return fromWebauthnDevices(userNumber, devices, withSecurityDevices)
}

export async function fromSeedPhrase(
  userNumber: bigint,
  seedPhrase: string,
  expected: DeviceData,
): Promise<LoginResult> {
  const identity = await fromMnemonicWithoutValidation(
    seedPhrase,
    IC_DERIVATION_PATH,
  )
  if (
    !arrayBufferEqual(
      identity.getPublicKey().toDer(),
      derFromPubkey(expected.pubkey),
    )
  ) {
    return {
      kind: "seedPhraseFail",
    }
  }
  const delegationIdentity = await requestFEDelegation(identity)

  replaceIdentity(delegationIdentity.delegationIdentity)
  authState.set(identity, delegationIdentity.delegationIdentity, ii)

  return {
    kind: "loginSuccess",
    userNumber,
    chain: delegationIdentity.chain,
    sessionKey: delegationIdentity.sessionKey,
  }
}

async function fromWebauthnDevices(
  userNumber: bigint,
  devices: DeviceData[],
  withSecurityDevices?: boolean,
): Promise<LoginResult> {
  const multiIdent = getMultiIdent(devices, withSecurityDevices)

  let delegation: FrontendDelegation
  try {
    delegation = await requestFEDelegation(multiIdent)
  } catch (error: unknown) {
    console.error(`Error when requesting delegation`, error)
    if (error instanceof Error) {
      return { kind: "authFail", error }
    } else {
      return {
        kind: "authFail",
        error: new Error("Unknown error when requesting delegation"),
      }
    }
  }

  replaceIdentity(delegation.delegationIdentity)
  authState.set(multiIdent._actualIdentity!, delegation.delegationIdentity, ii)

  return {
    kind: "loginSuccess",
    userNumber,
    chain: delegation.chain,
    sessionKey: delegation.sessionKey,
  }
}

export async function loginFromRemoteFrontendDelegation({
  userNumber,
  chain: chainJSON,
  sessionKey: sessionKeyJSON,
}: {
  userNumber: bigint
  chain: string
  sessionKey: string
}): Promise<LoginResult> {
  const [chain, sessionKey] = getDelegationFromJson(chainJSON, sessionKeyJSON)
  const delegationIdentity = DelegationIdentity.fromDelegation(
    sessionKey,
    chain,
  )

  const devices = await fetchAuthenticatorDevices(userNumber)
  const multiIdent = getMultiIdent(devices)

  replaceIdentity(delegationIdentity)
  authState.set(multiIdent._actualIdentity!, delegationIdentity, ii)

  return {
    kind: "loginSuccess",
    userNumber,
    chain,
    sessionKey,
  }
}

export async function loginfromGoogleDevice(identity: string): Promise<{
  chain: DelegationChain
  sessionKey: Ed25519KeyIdentity
}> {
  const googleIdentity = Ed25519KeyIdentity.fromJSON(identity)
  const frontendDelegation = await requestFEDelegation(googleIdentity)

  replaceIdentity(frontendDelegation.delegationIdentity)
  authState.set(googleIdentity, frontendDelegation.delegationIdentity, ii)
  return {
    chain: frontendDelegation.chain,
    sessionKey: frontendDelegation.sessionKey,
  }
}
