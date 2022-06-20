import { Actor, ActorSubclass, HttpAgent, SignIdentity } from "@dfinity/agent"
import { derBlobFromBlob, DerEncodedBlob } from "@dfinity/candid"
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
  WebAuthnIdentity,
} from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { Buffer } from "buffer"
import * as tweetnacl from "tweetnacl"

import {
  accessList,
  ii,
  InternetIdentity,
  invalidateIdentity,
  replaceIdentity,
} from "frontend/api/actors"
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
  DeviceKey,
  ChallengeResult,
} from "frontend/api/idl/internet_identity_types"

import { fromMnemonicWithoutValidation } from "./crypto/ed25519"
import { MultiWebAuthnIdentity } from "./multiWebAuthnIdentity"
import { hasOwnProperty } from "./utils"

const ONE_MINUTE_IN_M_SEC = 60 * 1000
const TEN_MINUTES_IN_M_SEC = 10 * ONE_MINUTE_IN_M_SEC

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

export type { ChallengeResult } from "frontend/api/idl/internet_identity_types"

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
      if (error instanceof Error) {
        return { kind: "authFail", error }
      } else {
        return {
          kind: "authFail",
          error: new Error("Unknown error when requesting delegation"),
        }
      }
    }

    const credential_id = Array.from(identity.rawId)
    const pubkey = Array.from(identity.getPublicKey().toDer())

    let registerResponse: RegisterResponse
    try {
      registerResponse = await ii.register(
        {
          alias,
          pubkey,
          credential_id: [credential_id],
          key_type: { unknown: null },
          purpose: { authentication: null },
        },
        challengeResult,
      )
    } catch (error: unknown) {
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
      devices = await this.lookupAuthenticators(userNumber, withSecurityDevices)
    } catch (e: unknown) {
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

  static async loginFromRemoteFrontendDelegation({
    userNumber,
    chain: chainJSON,
    sessionKey: sessionKeyJSON,
  }: {
    userNumber: bigint
    chain: string
    sessionKey: string
  }): Promise<LoginResult> {
    const { chain, sessionKey } = {
      chain: DelegationChain.fromJSON(chainJSON),
      sessionKey: Ed25519KeyIdentity.fromJSON(sessionKeyJSON),
    }
    const delegationIdentity = DelegationIdentity.fromDelegation(
      sessionKey,
      chain,
    )

    const devices = await IIConnection.lookupAuthenticators(userNumber)
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

    let delegationIdentity: FrontendDelegation
    try {
      delegationIdentity = await requestFEDelegation(multiIdent)
    } catch (e: unknown) {
      if (e instanceof Error) {
        return { kind: "authFail", error: e }
      } else {
        return {
          kind: "authFail",
          error: new Error("Unknown error when requesting delegation"),
        }
      }
    }

    replaceIdentity(delegationIdentity.delegationIdentity)

    return {
      kind: "loginSuccess",
      userNumber,
      chain: delegationIdentity.chain,
      sessionKey: delegationIdentity.sessionKey,
      internetIdentity: new IIConnection(
        // eslint-disable-next-line
        multiIdent._actualIdentity!,
        delegationIdentity.delegationIdentity,
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
      !identity.getPublicKey().toDer().equals(derFromPubkey(expected.pubkey))
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

  static async lookupAll(userNumber: UserNumber): Promise<DeviceData[]> {
    return await ii.lookup(userNumber)
  }

  static async createChallenge(): Promise<Challenge> {
    const challenge = await ii.create_challenge()
    return challenge
  }

  static async lookupAuthenticators(
    userNumber: UserNumber,
    withSecurityDevices?: boolean,
  ): Promise<DeviceData[]> {
    const allDevices = await ii.lookup(userNumber)

    return allDevices.filter((device) =>
      withSecurityDevices
        ? true
        : hasOwnProperty(device.purpose, "authentication"),
    )
  }

  static async lookupRecovery(userNumber: UserNumber): Promise<DeviceData[]> {
    const allDevices = await ii.lookup(userNumber)
    return allDevices.filter((device) =>
      hasOwnProperty(device.purpose, "recovery"),
    )
  }

  async renewDelegation() {
    for (const { delegation } of this.delegationIdentity.getDelegation()
      .delegations) {
      // prettier-ignore
      if (+new Date(Number(delegation.expiration / BigInt(1000000))) <= +Date.now()) {
        invalidateIdentity();
        break;
      }
    }

    if (this.actor === undefined) {
      // Create our actor with a DelegationIdentity to avoid re-prompting auth
      this.delegationIdentity = (
        await requestFEDelegation(this.identity)
      ).delegationIdentity
      replaceIdentity(this.delegationIdentity)
    }
  }

  async getRemoteFEDelegation(): Promise<any> {
    const { chain, sessionKey } = await requestFEDelegationChain(
      this.identity,
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
    newPublicKey: DerEncodedBlob,
    credentialId?: ArrayBuffer,
  ): Promise<void> => {
    await this.renewDelegation()
    return await ii.add(userNumber, {
      alias,
      pubkey: Array.from(newPublicKey),
      credential_id: credentialId ? [Array.from(credentialId)] : [],
      key_type: keyType,
      purpose,
    })
  }

  remove = async (
    userNumber: UserNumber,
    publicKey: PublicKey,
  ): Promise<void> => {
    await this.renewDelegation()
    await ii.remove(userNumber, publicKey)
  }

  getPrincipal = async (
    userNumber: UserNumber,
    frontend: FrontendHostname,
  ): Promise<Principal> => {
    await this.renewDelegation()
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
    await this.renewDelegation()
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
    await this.renewDelegation()
    return await ii.get_delegation(userNumber, hostname, sessionKey, timestamp)
  }
}

interface FrontendDelegation {
  delegationIdentity: DelegationIdentity
  chain: DelegationChain
  sessionKey: Ed25519KeyIdentity
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

export const derFromPubkey = (pubkey: DeviceKey): DerEncodedBlob =>
  derBlobFromBlob(new Blob([Buffer.from(pubkey)]))

const getMultiIdent = (
  devices: DeviceData[],
  withSecurityDevices?: boolean,
) => {
  return MultiWebAuthnIdentity.fromCredentials(
    devices.flatMap((device) =>
      device.credential_id.map((credentialId: CredentialId) => ({
        pubkey: derFromPubkey(device.pubkey),
        credentialId: new Blob([Buffer.from(credentialId)]),
      })),
    ),
    withSecurityDevices,
  )
}
