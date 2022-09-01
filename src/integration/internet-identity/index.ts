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

import { _SERVICE as InternetIdentity } from "frontend/integration/_ic_api/internet_identity_types"
import {
  ChallengeResult,
  DeviceData,
  PublicKey,
  SessionKey,
  SignedDelegation as IISignedDelegation,
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
import { ii } from "frontend/integration/actors"
import { fromMnemonicWithoutValidation } from "frontend/integration/internet-identity/crypto/ed25519"
import { ThirdPartyAuthSession } from "frontend/state/authorization"

import { mapOptional, mapVariant, reverseMapOptional } from "../_common"
import { MultiWebAuthnIdentity } from "../identity/multiWebAuthnIdentity"
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

export interface FrontendDelegation {
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
  // NOTE: NOT SURE IF WE NEED THOSE
  let _chain: DelegationChain | undefined
  let _sessionKey: Ed25519KeyIdentity | undefined

  return {
    setDelegationIdentity(delegationIdentity: DelegationIdentity) {
      _delegationIdentity = delegationIdentity
    },
    set(
      identity: SignIdentity,
      delegationIdentity: DelegationIdentity,
      actor: ActorSubclass<InternetIdentity>,
      chain?: DelegationChain | undefined,
      sessionKey?: Ed25519KeyIdentity | undefined,
    ) {
      console.debug("authState.set", { identity, delegationIdentity })
      _actor = actor
      _identity = identity
      _delegationIdentity = delegationIdentity
      _chain = chain
      _sessionKey = sessionKey
      replaceIdentity(delegationIdentity)
    },
    get: () => ({
      identity: _identity,
      delegationIdentity: _delegationIdentity,
      actor: _actor,
      chain: _chain,
      sessionKey: _sessionKey,
    }),
    reset() {
      console.debug("authState.reset")
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
  const challenge = await ii.create_challenge().catch((e) => {
    throw new Error(`createChallenge: ${e.message}`)
  })
  return challenge
}

declare const IS_E2E_TEST: string

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
      ...(IS_E2E_TEST === "true" ? {} : { authenticatorAttachment }),
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
  return await ii.lookup(anchor).catch((e) => {
    throw new Error(`fetchAllDevices: ${e.message}`)
  })
}

export async function fetchAuthenticatorDevices(
  anchor: UserNumber,
  withSecurityDevices?: boolean,
) {
  const allDevices = await fetchAllDevices(anchor)

  return allDevices.filter((device) =>
    withSecurityDevices
      ? true
      : hasOwnProperty(device.purpose, "authentication"),
  )
}

export async function fetchRecoveryDevices(anchor: UserNumber) {
  const allDevices = await fetchAllDevices(anchor)
  return allDevices.filter((device) =>
    hasOwnProperty(device.purpose, "recovery"),
  )
}

export const requestFEDelegationChain = async (
  identity: SignIdentity,
  ttl: number = TEN_MINUTES_IN_M_SEC,
) => {
  console.debug("Request FE Delegation Chain.")
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

export let requestFEDelegation = async (
  identity: SignIdentity,
): Promise<FrontendDelegation> => {
  console.debug("requestFEDelegation")
  const { sessionKey, chain } = await requestFEDelegationChain(identity)
  console.debug("requestFEDelegation", { sessionKey, chain })

  const delegationIdentity = DelegationIdentity.fromDelegation(
    sessionKey,
    chain,
  )

  console.debug("requestFEDelegation", { delegationIdentity })

  return {
    delegationIdentity,
    chain,
    sessionKey,
  }
}

async function renewDelegation() {
  const { delegationIdentity, actor, identity } = authState.get()
  console.debug("renewDelegation", { identity, delegationIdentity })
  if (!delegationIdentity || !identity)
    throw new Error(`renewDelegation unauthorized`)

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
  return await ii
    .prepare_delegation(
      userNumber,
      hostname,
      sessionKey,
      maxTimeToLive !== undefined ? [maxTimeToLive] : [],
    )
    .catch((e) => {
      throw new Error(`prepareDelegation: ${e.message}`)
    })
}

const retryGetDelegation = async (
  userNumber: bigint,
  hostname: string,
  sessionKey: PublicKey,
  timestamp: bigint,
  maxRetries = 5,
): Promise<IISignedDelegation> => {
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
  return await ii
    .get_delegation(userNumber, hostname, sessionKey, timestamp)
    .catch((e) => {
      throw new Error(`getDelegation: ${e.message}`)
    })
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
): Promise<[PublicKey, IISignedDelegation]> {
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
  signedDelegation: IISignedDelegation,
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
  //register only protected recovery phrase
  let protectionType = hasOwnProperty(keyType, "seed_phrase")
    ? { protected: null }
    : { unprotected: null }
  // NOTE: removed the call to renewDelegation. It was failing because
  // of missing identity from authState. We'll replace this entire logic within
  // the following refactor and need to take care of the authState in
  // a better way.
  return await ii
    .add(anchor, {
      alias,
      pubkey: Array.from(new Uint8Array(newPublicKey)),
      credential_id: credentialId
        ? [Array.from(new Uint8Array(credentialId))]
        : [],
      key_type: keyType,
      purpose,
      protection: protectionType,
    })
    .catch((e) => {
      throw new Error(`addDevice: ${e.message}`)
    })
}

export async function removeDevice(
  userNumber: UserNumber,
  publicKey: PublicKey,
): Promise<void> {
  await renewDelegation()
  await ii.remove(userNumber, publicKey).catch((e) => {
    throw new Error(`removeDevice: ${e.message}`)
  })
}

export async function removeRecoveryDeviceII(
  userNumber: UserNumber,
  seedPhrase: string,
) {
  let { delegationIdentity } = authState.get()
  if (!delegationIdentity) {
    throw Error("Unauthenticated")
  }
  await asRecoveryIdentity(seedPhrase)

  let recoveryPhraseDeviceData = (await ii
    .lookup(userNumber)
    .then((x) =>
      x.find((d) => hasOwnProperty(d.purpose, "recovery")),
    )) as DeviceData
  if (!recoveryPhraseDeviceData) {
    throw Error("Seed phrase not registered")
  }

  await removeDevice(userNumber, recoveryPhraseDeviceData.pubkey)
  replaceIdentity(delegationIdentity)
  return recoveryPhraseDeviceData.pubkey
}

export async function updateDevice(
  userNumber: UserNumber,
  publicKey: PublicKey,
  deviceData: DeviceData,
): Promise<void> {
  await ii.update(userNumber, publicKey, deviceData).catch((e) => {
    throw new Error(`Failed to update device: ${e.message}`)
  })
}

export async function protectRecoveryPhrase(
  userNumber: UserNumber,
  seedPhrase: string,
): Promise<void> {
  let { delegationIdentity } = authState.get()
  if (!delegationIdentity) {
    throw Error("Unauthenticated")
  }
  await asRecoveryIdentity(seedPhrase)
  let recoveryPhraseDeviceData = (await ii
    .lookup(userNumber)
    .then((x) =>
      x.find((d) => hasOwnProperty(d.purpose, "recovery")),
    )) as DeviceData
  recoveryPhraseDeviceData.protection = { protected: null }
  await updateDevice(
    userNumber,
    recoveryPhraseDeviceData.pubkey,
    recoveryPhraseDeviceData,
  )
  replaceIdentity(delegationIdentity)
}

async function asRecoveryIdentity(seedPhrase: string) {
  const identity = await fromMnemonicWithoutValidation(
    seedPhrase,
    IC_DERIVATION_PATH,
  )
  const frontendDelegation = await requestFEDelegation(identity)
  replaceIdentity(frontendDelegation.delegationIdentity)
}

async function registerAnchor(
  alias: string,
  challengeResult: ChallengeResult,
  pubkey: number[],
  credentialId?: number[],
) {
  return await ii
    .register(
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
    .catch((e) => {
      throw new Error(`registerAnchor: ${e.message}`)
    })
}

export const getMultiIdent = (
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
  authState.set(identity, delegation.delegationIdentity, ii)

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
  console.debug("login", { userNumber, withSecurityDevices })
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

/**
 * @param {string} seedPhrase NEVER LOG THE RECOVERY PHRASE KEY IDENTITY TO CONSOLE OR SEND TO EXTERNAL SERVICE
 */
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
  console.debug("fromWebauthnDevices", {
    userNumber,
    devices,
    withSecurityDevices,
  })

  const multiIdent = getMultiIdent(devices, withSecurityDevices)
  // console.debug("fromWebauthnDevices", {
  //   multiIdent,
  //   multiIdentPrincipalId: multiIdent.getPrincipal().toText(),
  // })

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
  console.debug("fromWebauthnDevices", {
    delegation,
    delegationPrincipalId: delegation.delegationIdentity
      .getPrincipal()
      .toText(),
  })

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
  console.debug("loginFromRemoteFrontendDelegation", {
    userNumber,
    chainJSON,
    sessionKeyJSON,
  })
  const [chain, sessionKey] = getDelegationFromJson(chainJSON, sessionKeyJSON)
  const delegationIdentity = DelegationIdentity.fromDelegation(
    sessionKey,
    chain,
  )

  const devices = await fetchAuthenticatorDevices(userNumber)
  const multiIdent = getMultiIdent(devices)
  console.debug("loginFromRemoteFrontendDelegation", { devices, multiIdent })

  authState.set(multiIdent._actualIdentity!, delegationIdentity, ii)

  return {
    kind: "loginSuccess",
    userNumber,
    chain,
    sessionKey,
  }
}

/**
 *
 * @param identity ed25519 key identity as json string (returned from google lambda)
 * @returns
 */
export async function loginfromGoogleDevice(identity: string): Promise<void> {
  const googleIdentity = Ed25519KeyIdentity.fromJSON(identity)
  const frontendDelegation = await requestFEDelegation(googleIdentity)

  authState.set(googleIdentity, frontendDelegation.delegationIdentity, ii)
}

export interface ReconstructableIdentity {
  chain: DelegationChain
  sessionKey: Ed25519KeyIdentity
}

/**
 * Cast an identity into a reconstructable form for transmission purposes (i.e. sending authenticated delegate from remote device).
 * @param identity a delegation identity
 * @returns javascript object that can be reconstructed into a delegation identity
 */
export async function getReconstructableIdentity(
  identity: SignIdentity,
): Promise<{
  chain: DelegationChain
  sessionKey: Ed25519KeyIdentity
}> {
  const frontendDelegation = await requestFEDelegation(identity)
  return {
    chain: frontendDelegation.chain,
    sessionKey: frontendDelegation.sessionKey,
  }
}

export function reconstructIdentity({
  chain: jsonAbleChain,
  sessionKey: jsonAbleSessionKey,
}: ReconstructableIdentity): DelegationIdentity {
  const [chain, sessionKey] = getDelegationFromJson(
    JSON.stringify(jsonAbleChain),
    JSON.stringify(jsonAbleSessionKey),
  )
  return DelegationIdentity.fromDelegation(sessionKey, chain)
}

// --

// This whole file is a big nightmare. I'm starting again down here. 😂

export interface SignedDelegation {
  delegation: {
    expiration: bigint
    pubkey: PublicKey
    targets: Principal[] | undefined
  }
  signature: Array<number>
}

/**
 * Prepare a third party auth session.
 * @param userNumber
 * @param scope
 * @param sessionKey session key generated and provided by 3rd party connecting app
 * @param maxTimeToLive
 * @returns public key and timestamp (for lookup)
 */
export async function prepareDelegate(
  userNumber: number,
  scope: string,
  sessionKey: PublicKey,
  maxTimeToLive?: bigint,
) {
  console.debug("prepareDelegate", {
    userNumber,
    scope,
    sessionKey,
    maxTimeToLive,
  })
  return ii
    .prepare_delegation(
      BigInt(userNumber),
      scope,
      sessionKey,
      reverseMapOptional(maxTimeToLive ? maxTimeToLive : undefined),
    )
    .then(([userPublicKey, timestamp]) => ({
      userPublicKey: new Uint8Array(userPublicKey),
      timestamp: timestamp,
    }))
}

/**
 * Retrieve prepared third party auth session.
 * @param userNumber
 * @param scope
 * @param sessionKey
 * @param timestamp
 * @returns signed delegate
 */
export async function getDelegate(
  userNumber: number,
  scope: string,
  sessionKey: PublicKey,
  timestamp: bigint,
): Promise<SignedDelegation> {
  console.debug("getDelegate", { userNumber, scope, sessionKey, timestamp })

  return ii
    .get_delegation(BigInt(userNumber), scope, sessionKey, timestamp)
    .then((r) => {
      if ("signed_delegation" in r) {
        return {
          delegation: {
            expiration: r.signed_delegation.delegation.expiration,
            pubkey: r.signed_delegation.delegation.pubkey,
            targets: mapOptional(r.signed_delegation.delegation.targets),
          },
          signature: r.signed_delegation.signature,
        }
      }
      throw new Error("No such delegation")
    })
}

export async function getDelegateRetry(
  userNumber: number,
  scope: string,
  sessionKey: PublicKey,
  timestamp: bigint,
): Promise<SignedDelegation> {
  for (let i = 0; i < 10; i++) {
    try {
      // Linear backoff
      await new Promise((resolve) => {
        setInterval(resolve, 1000 * i)
      })
      return await getDelegate(userNumber, scope, sessionKey, timestamp)
    } catch (e) {
      console.warn("Failed to retrieve delegation.", e)
    }
  }
  throw new Error(`Failed to retrieve a delegation after ${10} retries.`)
}

export async function fetchDelegate(
  userNumber: number,
  scope: string,
  sessionKey: PublicKey,
  maxTimeToLive?: bigint,
): Promise<ThirdPartyAuthSession> {
  console.debug("fetchDelegate", {
    userNumber,
    scope,
    sessionKey,
    maxTimeToLive,
  })
  const prepare = await prepareDelegate(
    userNumber,
    scope,
    sessionKey,
    maxTimeToLive,
  )
  console.debug(`fetchDelegate prepareDelegate`, { response: prepare })

  const signedDelegation = await getDelegateRetry(
    userNumber,
    scope,
    sessionKey,
    prepare.timestamp,
  )
  console.debug(`fetchDelegate getDelegate`, { signedDelegation })

  return {
    signedDelegation,
    userPublicKey: prepare.userPublicKey,
  }
}

export interface CaptchaChallenge {
  pngBase64: string
  challengeKey: string
}

export function mapChallenge(challenge: Challenge): CaptchaChallenge {
  return {
    pngBase64: challenge.png_base64,
    challengeKey: challenge.challenge_key,
  }
}

/**
 * Get a captcha from internet identity.
 * @returns
 */
export async function fetchChallenge() {
  return await ii
    .create_challenge()
    .then(mapChallenge)
    .catch((e) => {
      throw new Error(`fetchChallenge: ${e.message}`)
    })
}

function mapRegisterResponse(response: RegisterResponse) {
  if ("canister_full" in response) {
    throw new Error(
      "Internet Identity canister is out of space, ping Dominic Williams",
    )
  } else if ("bad_challenge" in response) {
    throw new Error(
      `There was a problem with your captcha response, please try again.`,
    )
  } else if ("registered" in response) {
    return Number(response.registered.user_number)
  } else {
    console.error(`Unexpected response from internet identity`, response)
    throw new Error(`Something went wrong, please try again later.`)
  }
}

/**
 * Register a new internet identity anchor.
 * @param identity user's webauthn identity
 * @param alias device name
 * @param challengeResult completed captcha
 * @returns registered anchor number
 */
export async function registerInternetIdentity(
  identity: WebAuthnIdentity,
  alias: string,
  challengeResult: ChallengeResult,
) {
  console.debug("Register new internet identity")
  const delegation = await requestFEDelegation(identity)

  const credentialId = Array.from(new Uint8Array(identity.rawId))
  const pubkey = Array.from(new Uint8Array(identity.getPublicKey().toDer()))

  authState.set(
    identity,
    delegation.delegationIdentity,
    ii,
    delegation.chain,
    delegation.sessionKey,
  )

  const anchor = await ii
    .register(
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
    .then(mapRegisterResponse)

  return {
    anchor,
    delegationIdentity: delegation.delegationIdentity,
  }
}

export function mapDeviceData(data: DeviceData): Device {
  const credential = mapOptional(data.credential_id)

  return {
    alias: data.alias,
    protected: "protected" in data.protection,
    pubkey: data.pubkey,
    keyType: mapVariant(data.key_type),
    purpose: mapVariant(data.purpose),
    credentialId: credential,
  }
}

/**
 * Retrieve devices on internet identity anchor.
 * @param anchor II user number
 * @param withSecurityDevices flag to include recovery devices
 * @returns list of devices on the II anchor
 */
export async function lookup(anchor: number, withSecurityDevices: boolean) {
  return await ii
    .lookup(BigInt(anchor))
    .then((r) => r.map(mapDeviceData))
    .then((r) =>
      r.filter((device) =>
        withSecurityDevices ? true : device.purpose === "authentication",
      ),
    )
}

export interface Device {
  alias: string
  protected: boolean
  pubkey: PublicKey
  keyType: "platform" | "seed_phrase" | "cross_platform" | "unknown"
  purpose: "authentication" | "recovery"
  credentialId?: CredentialId
}

/**
 * Retrieve user's principal for a domain + persona hash.
 * @param anchor
 * @param salt
 */
export function fetchPrincipal(anchor: number, salt: string) {
  return ii.get_principal(BigInt(anchor), salt)
}

export const delegationIdentityFromSignedIdentity = async (
  sessionKey: Pick<SignIdentity, "sign">,
  chain: DelegationChain,
): Promise<DelegationIdentity> => {
  const delegationIdentity = DelegationIdentity.fromDelegation(
    sessionKey,
    chain,
  )

  return delegationIdentity
}
