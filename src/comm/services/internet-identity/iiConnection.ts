import {
  ActorSubclass,
  DerEncodedPublicKey,
  SignIdentity,
} from "@dfinity/agent"
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
  WebAuthnIdentity,
} from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { Buffer } from "buffer"
import { arrayBufferEqual } from "ictool/dist/bits"
import * as tweetnacl from "tweetnacl"

import { ii, InternetIdentity, replaceIdentity } from "frontend/comm/actors"
import {
  PublicKey,
  SessionKey,
  CredentialId,
  Challenge,
  UserNumber,
  FrontendHostname,
  Timestamp,
  DeviceData,
  RegisterResponse,
  GetDelegationResponse,
  Purpose,
  KeyType,
  ChallengeResult,
} from "frontend/comm/idl/internet_identity_types"
import {
  addDevice,
  fetchAuthenticatorDevices,
  authState,
  getDelegationFromJson,
  renewDelegation,
  requestFEDelegation,
  requestFEDelegationChain,
  registerAnchor,
} from "frontend/integration/internet-identity"
import { derFromPubkey } from "frontend/integration/internet-identity/utils"

import { fromMnemonicWithoutValidation } from "./crypto/ed25519"
import { MultiWebAuthnIdentity } from "./multiWebAuthnIdentity"
import { hasOwnProperty } from "./utils"

const ONE_MINUTE_IN_M_SEC = 60 * 1000

export const IC_DERIVATION_PATH = [44, 223, 0, 0, 0]

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
  internetIdentity: IIConnection
  userNumber: bigint
}

type BadChallenge = { kind: "badChallenge" }
type UnknownUser = { kind: "unknownUser"; userNumber: bigint }
type AuthFail = { kind: "authFail"; error: Error }
type ApiError = { kind: "apiError"; error: Error }
type RegisterNoSpace = { kind: "registerNoSpace" }
type SeedPhraseFail = { kind: "seedPhraseFail" }

export type { ChallengeResult } from "frontend/comm/idl/internet_identity_types"

export class IIConnection {
  protected constructor(
    public identity: SignIdentity,
    public delegationIdentity: DelegationIdentity,
    public actor?: ActorSubclass<InternetIdentity>,
  ) {}

  static async register(
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

    replaceIdentity(delegation.delegationIdentity)

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
      replaceIdentity(delegation.delegationIdentity)
      return {
        kind: "loginSuccess",
        chain: delegation.chain,
        sessionKey: delegation.sessionKey,
        internetIdentity: new IIConnection(
          identity,
          delegation.delegationIdentity,
          ii,
        ),
        userNumber,
      }
    } else if (hasOwnProperty(registerResponse, "bad_challenge")) {
      return { kind: "badChallenge" }
    } else {
      console.error("unexpected register response", registerResponse)
      throw Error("unexpected register response")
    }
  }

  static async registerFromGoogle(
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
        internetIdentity: new IIConnection(
          identity,
          delegation.delegationIdentity,
          ii,
        ),
        userNumber,
      }
    } else if (hasOwnProperty(registerResponse, "bad_challenge")) {
      return { kind: "badChallenge" }
    } else {
      console.error("unexpected register response", registerResponse)
      throw Error("unexpected register response")
    }
  }

  static async login(
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

    return this.fromWebauthnDevices(userNumber, devices, withSecurityDevices)
  }

  // NOTE: CURRENT SCOPE
  static async loginFromRemoteFrontendDelegation({
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

    return {
      kind: "loginSuccess",
      userNumber,
      chain,
      sessionKey,
      internetIdentity: new IIConnection(
        // eslint-disable-next-line
        multiIdent._actualIdentity!,
        delegationIdentity,
        ii,
      ),
    }
  }

  static async fromWebauthnDevices(
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

    return {
      kind: "loginSuccess",
      userNumber,
      chain: delegation.chain,
      sessionKey: delegation.sessionKey,
      internetIdentity: new IIConnection(
        // eslint-disable-next-line
        multiIdent._actualIdentity!,
        delegation.delegationIdentity,
        ii,
      ),
    }
  }

  static async fromSeedPhrase(
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

    return {
      kind: "loginSuccess",
      userNumber,
      chain: delegationIdentity.chain,
      sessionKey: delegationIdentity.sessionKey,
      internetIdentity: new IIConnection(
        identity,
        delegationIdentity.delegationIdentity,
        ii,
      ),
    }
  }

  static async loginfromGoogleDevice(identity: string): Promise<{
    chain: DelegationChain
    sessionKey: Ed25519KeyIdentity
    internetIdentity: IIConnection
  }> {
    const googleIdentity = Ed25519KeyIdentity.fromJSON(identity)
    const frontendDelegation = await requestFEDelegation(googleIdentity)

    replaceIdentity(frontendDelegation.delegationIdentity)
    // return googleIdentity
    return {
      chain: frontendDelegation.chain,
      sessionKey: frontendDelegation.sessionKey,
      internetIdentity: new IIConnection(
        googleIdentity,
        frontendDelegation.delegationIdentity,
        ii,
      ),
    }
  }

  static async createChallenge(): Promise<Challenge> {
    const challenge = await ii.create_challenge()
    return challenge
  }

  async getRemoteFEDelegation(): Promise<any> {
    const { identity } = authState.get()
    const { chain, sessionKey } = await requestFEDelegationChain(
      identity,
      ONE_MINUTE_IN_M_SEC,
    )
    return {
      chain: chain.toJSON(),
      sessionKey: sessionKey.toJSON(),
    }
  }

  add = async (
    userNumber: UserNumber,
    alias: string,
    keyType: KeyType,
    purpose: Purpose,
    newPublicKey: DerEncodedPublicKey,
    credentialId?: ArrayBuffer,
  ): Promise<void> => {
    await renewDelegation()
    return await addDevice(
      userNumber,
      alias,
      keyType,
      purpose,
      newPublicKey,
      credentialId,
    )
  }

  remove = async (
    userNumber: UserNumber,
    publicKey: PublicKey,
  ): Promise<void> => {
    await renewDelegation()
    await ii.remove(userNumber, publicKey)
  }

  getPrincipal = async (
    userNumber: UserNumber,
    frontend: FrontendHostname,
  ): Promise<Principal> => {
    await renewDelegation()
    return await ii.get_principal(userNumber, frontend)
  }

  prepareDelegation = async (
    userNumber: UserNumber,
    hostname: FrontendHostname,
    sessionKey: SessionKey,
    maxTimeToLive?: bigint,
  ): Promise<[PublicKey, bigint]> => {
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

  getDelegation = async (
    userNumber: UserNumber,
    hostname: FrontendHostname,
    sessionKey: SessionKey,
    timestamp: Timestamp,
  ): Promise<GetDelegationResponse> => {
    console.log(
      `get_delegation(user: ${userNumber}, hostname: ${hostname}, session_key: ${sessionKey}, timestamp: ${timestamp})`,
    )
    await renewDelegation()
    return await ii.get_delegation(userNumber, hostname, sessionKey, timestamp)
  }
}

interface FrontendDelegation {
  delegationIdentity: DelegationIdentity
  chain: DelegationChain
  sessionKey: Ed25519KeyIdentity
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
