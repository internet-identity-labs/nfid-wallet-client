import { DerEncodedPublicKey, SignIdentity } from "@dfinity/agent"
import { fromHexString } from "@dfinity/candid/lib/cjs/utils/buffer"
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
  WebAuthnIdentity,
} from "@dfinity/identity"
import { arrayBufferEqual } from "src/integration/identity/services"

import {
  authState,
  FrontendDelegation,
  getPrincipalId,
  mapOptional,
  Profile,
  requestFEDelegation,
  requestFEDelegationChain,
} from "@nfid/integration"
import { ii, im, replaceIdentity } from "@nfid/integration"

import {
  Challenge,
  ChallengeResult,
  CredentialId,
  DeviceData,
  FrontendHostname,
  GetDelegationResponse,
  KeyType,
  PublicKey,
  Purpose,
  RegisterResponse,
  SessionKey,
  SignedDelegation as IISignedDelegation,
  Timestamp,
  UserNumber,
} from "frontend/integration/_ic_api/internet_identity.d"
import { fromMnemonicWithoutValidation } from "frontend/integration/internet-identity/crypto/ed25519"

import { mapVariant } from "../_common"
import { getBrowserName } from "../device"
import { fetchProfile } from "../identity-manager"
import { MultiWebAuthnIdentity } from "../identity/multiWebAuthnIdentity"
import { getCredentials } from "../webauthn/creation-options"
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

export type { ChallengeResult } from "frontend/integration/_ic_api/internet_identity.d"

export interface JSONSerialisableSignedDelegation {
  delegation: {
    pubkey: PublicKey
    expiration: string
    targets: undefined
  }
  signature: number[]
  userKey: PublicKey
}

export const IC_DERIVATION_PATH = [44, 223, 0, 0, 0]

export async function createChallenge(): Promise<Challenge> {
  const challenge = await ii.create_challenge().catch((e) => {
    throw new Error(`createChallenge: ${e.message}`)
  })
  return challenge
}

export async function fetchAllDevices(anchor: UserNumber) {
  const deviceData = (
    await ii.lookup(anchor).catch((e) => {
      throw new Error(`fetchAllDevices: ${e.message}`)
    })
  ).map((deviceData) => {
    const principalId = getPrincipalId(deviceData.pubkey)

    if (!!authState.get().delegationIdentity)
      return {
        ...deviceData,
        principalId,
      }
    else
      return {
        ...deviceData,
        principalId,
        alias: "",
      }
  })
  console.debug("fetchAllDevices", { deviceData })
  return deviceData
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
      // @ts-ignore
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
  protect?: boolean,
) {
  //register only protected recovery phrase
  let protectionType = hasOwnProperty(keyType, "seed_phrase")
    ? { protected: null }
    : { unprotected: null }

  if (protect === false) protectionType = { unprotected: null }
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
  await ii.remove(userNumber, publicKey).catch((e) => {
    throw new Error(`removeDevice: ${e.message}`)
  })
}

export async function removeRecoveryDeviceII(
  userNumber: UserNumber,
  seedPhrase: string,
) {
  const { delegationIdentity } = authState.get()
  if (!delegationIdentity) {
    throw Error("Unauthenticated")
  }
  await asRecoveryIdentity(seedPhrase)

  const recoveryPhraseDeviceData = (await ii
    .lookup(userNumber)
    .then((x) =>
      x.find((d) => hasOwnProperty(d.purpose, "recovery")),
    )) as DeviceData

  if (!recoveryPhraseDeviceData) {
    throw Error("Seed phrase not registered")
  }

  await removeDevice(userNumber, recoveryPhraseDeviceData.pubkey)
  replaceIdentity(delegationIdentity, "removeRecoveryDeviceII")
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
  const { delegationIdentity } = authState.get()
  if (!delegationIdentity) {
    throw Error("Unauthenticated")
  }
  await asRecoveryIdentity(seedPhrase)
  const recoveryPhraseDeviceData = (await ii
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
  replaceIdentity(delegationIdentity, "protectRecoveryPhrase")
}

async function asRecoveryIdentity(seedPhrase: string) {
  const identity = await fromMnemonicWithoutValidation(
    seedPhrase,
    IC_DERIVATION_PATH,
  )
  const { sessionKey, chain } = await requestFEDelegationChain(identity)
  const delegationIdentity = DelegationIdentity.fromDelegation(
    sessionKey,
    chain,
  )
  replaceIdentity(delegationIdentity, "asRecoveryIdentity")
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
  devices: Device[],
  withSecurityDevices?: boolean,
) => {
  return MultiWebAuthnIdentity.fromCredentials(
    getCredentials(devices),
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

  await authState.set({
    identity,
    delegationIdentity: delegation.delegationIdentity,
  })

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
    // FIXME: type guard
    // @ts-ignore
    const userNumber = registerResponse["registered"].user_number
    console.log(`registered Identity Anchor ${userNumber}`)
    await authState.set({
      identity,
      delegationIdentity: delegation.delegationIdentity,
    })
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
  await authState.set({
    identity,
    delegationIdentity: delegation.delegationIdentity,
  })

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
    // FIXME: type guard
    // @ts-ignore
    const userNumber = registerResponse["registered"].user_number
    console.debug(`registered Identity Anchor ${userNumber}`)
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
  let devices: Device[]
  try {
    const predicate: ((x: Device) => boolean) | undefined = withSecurityDevices
      ? undefined
      : (x) => x.purpose === "authentication"
    devices = await lookup(Number(userNumber), predicate)
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

  let profile: Profile
  try {
    replaceIdentity(delegationIdentity.delegationIdentity)
    await authState.set({
      identity,
      delegationIdentity: delegationIdentity.delegationIdentity,
    })
    await im.sync_recovery_phrase_from_internet_identity(userNumber)
    profile = await fetchProfile()
  } catch (_e) {
    throw new Error("This is not an NFID recovery phrase.")
  }

  return {
    kind: "loginSuccess",
    userNumber: BigInt(profile.anchor),
    chain: delegationIdentity.chain,
    sessionKey: delegationIdentity.sessionKey,
  }
}

async function fromWebauthnDevices(
  userNumber: bigint,
  devices: Device[],
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

  replaceIdentity(delegation.delegationIdentity)
  await authState.set({
    identity: multiIdent._actualIdentity!,
    delegationIdentity: delegation.delegationIdentity,
  })

  im.use_access_point([getBrowserName()]).catch((error) => {
    console.log(error)
    throw new Error(`fromWebauthnDevices im.use_access_point: ${error.message}`)
  })

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
  console.debug("loginFromRemoteFrontendDelegation")
  const [chain, sessionKey] = getDelegationFromJson(chainJSON, sessionKeyJSON)
  const delegationIdentity = DelegationIdentity.fromDelegation(
    sessionKey,
    chain,
  )

  const devices = await lookup(
    Number(userNumber),
    (x) => x.purpose === "authentication",
  )
  const multiIdent = getMultiIdent(devices)
  console.debug("loginFromRemoteFrontendDelegation", { devices })

  await authState.set({
    identity: multiIdent._actualIdentity!,
    delegationIdentity,
  })

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

  await authState.set({
    identity: googleIdentity,
    delegationIdentity: frontendDelegation.delegationIdentity,
  })
  im.use_access_point([getBrowserName()]).catch((error) => {
    throw new Error(
      `loginfromGoogleDevice im.use_access_point: ${error.message}`,
    )
  })
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

  await authState.set({
    identity,
    delegationIdentity: delegation.delegationIdentity,
    chain: delegation.chain,
    sessionKey: delegation.sessionKey,
  })

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

/**
 * Register a new internet identity anchor using ii as a device.
 * @param identity II delegationIdentity
 * @param alias device name
 * @param challengeResult completed captcha
 * @returns registered anchor number
 */
export async function registerInternetIdentityWithII(
  pubkey: number[],
  alias: string,
  challengeResult: ChallengeResult,
) {
  console.debug("Register new internet identity")

  return await ii
    .register(
      {
        alias,
        pubkey,
        credential_id: [],
        key_type: { unknown: null },
        purpose: { authentication: null },
        protection: { unprotected: null },
      },
      challengeResult,
    )
    .then(mapRegisterResponse)
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
export async function lookup(
  anchor: number,
  predicate?: (device: Device) => boolean,
) {
  return await ii
    .lookup(BigInt(anchor))
    .then((r) => r.map(mapDeviceData))
    .then((r) => {
      if (predicate) {
        return r.filter(predicate)
      }
      return r
    })
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
 * @param scope
 */
export function fetchPrincipal(anchor: number, scope: string) {
  return ii.get_principal(BigInt(anchor), scope)
}
