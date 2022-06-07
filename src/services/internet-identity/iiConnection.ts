import { Actor, ActorSubclass, HttpAgent, SignIdentity } from "@dfinity/agent"
import {
  BinaryBlob,
  blobFromUint8Array,
  derBlobFromBlob,
  DerEncodedBlob,
} from "@dfinity/candid"
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
  WebAuthnIdentity,
} from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { Buffer } from "buffer"
import * as tweetnacl from "tweetnacl"

import { _SERVICE as IdentityManagerService } from "frontend/services/identity-manager/identity_manager.did"
import { idlFactory as IdentityManagerIdlFactory } from "frontend/services/identity-manager/identity_manager_idl"
import { _SERVICE as ImAdditionService } from "frontend/services/iiw/im_addition.did"
import { idlFactory as ImAdditionIdlFactory } from "frontend/services/iiw/im_addition_idl"
import { _SERVICE as PubsubChannelService } from "frontend/services/pub-sub-channel/pub_sub_channel.did"
import { idlFactory as PubsubChannelIdlFactory } from "frontend/services/pub-sub-channel/pub_sub_channel_idl"

import { fromMnemonicWithoutValidation } from "./crypto/ed25519"
import { idlFactory as internet_identity_idl } from "./generated/internet_identity_idl"
import {
  _SERVICE,
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
} from "./generated/internet_identity_types"
import { MultiWebAuthnIdentity } from "./multiWebAuthnIdentity"
import { hasOwnProperty } from "./utils"

const ONE_MINUTE_IN_M_SEC = 60 * 1000
const TEN_MINUTES_IN_M_SEC = 10 * ONE_MINUTE_IN_M_SEC

declare const II_ENV: string
declare const IC_HOST: string
declare const INTERNET_IDENTITY_CANISTER_ID: string
declare const IDENTITY_MANAGER_CANISTER_ID: string
declare const PUB_SUB_CHANNEL_CANISTER_ID: string
declare const IM_ADDITION_CANISTER_ID: string

if (!INTERNET_IDENTITY_CANISTER_ID)
  throw new Error(
    "you need to add INTERNET_IDENTITY_CANISTER_ID to your environment",
  )

const getAgent = () => {
  const agent = new HttpAgent({
    host: IC_HOST,
  })

  // Only fetch the root key when we're not in prod
  if (II_ENV === "development") {
    agent.fetchRootKey()
  }
  return agent
}

export const canisterIdPrincipal: Principal = Principal.fromText(
  INTERNET_IDENTITY_CANISTER_ID,
)

export const baseActor = Actor.createActor<_SERVICE>(internet_identity_idl, {
  agent: getAgent(),
  canisterId: INTERNET_IDENTITY_CANISTER_ID,
})

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
  identityManager: ActorSubclass<IdentityManagerService>
  pubsubChannelActor: ActorSubclass<PubsubChannelService>
  imAdditionActor: ActorSubclass<ImAdditionService>
  userNumber: bigint
}

type BadChallenge = { kind: "badChallenge" }
type UnknownUser = { kind: "unknownUser"; userNumber: bigint }
type AuthFail = { kind: "authFail"; error: Error }
type ApiError = { kind: "apiError"; error: Error }
type RegisterNoSpace = { kind: "registerNoSpace" }
type SeedPhraseFail = { kind: "seedPhraseFail" }

export type { ChallengeResult } from "./generated/internet_identity_types"

export class IIConnection {
  protected constructor(
    public identity: SignIdentity,
    public delegationIdentity: DelegationIdentity,
    public actor?: ActorSubclass<_SERVICE>,
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

    const actor = await IIConnection.createActor(delegation.delegationIdentity)
    const credential_id = Array.from(identity.rawId)
    const pubkey = Array.from(identity.getPublicKey().toDer())

    let registerResponse: RegisterResponse
    try {
      registerResponse = await actor.register(
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
      return {
        kind: "loginSuccess",
        chain: delegation.chain,
        sessionKey: delegation.sessionKey,
        internetIdentity: new IIConnection(
          identity,
          delegation.delegationIdentity,
          actor,
        ),
        identityManager: await this.createServiceActor<IdentityManagerService>(
          delegation.delegationIdentity,
          IdentityManagerIdlFactory,
          IDENTITY_MANAGER_CANISTER_ID,
        ),
        pubsubChannelActor: await this.createServiceActor<PubsubChannelService>(
          delegation.delegationIdentity,
          PubsubChannelIdlFactory,
          PUB_SUB_CHANNEL_CANISTER_ID,
        ),
        imAdditionActor: await this.createServiceActor<ImAdditionService>(
          delegation.delegationIdentity,
          ImAdditionIdlFactory,
          IM_ADDITION_CANISTER_ID,
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
    const actor = await IIConnection.createActor(delegationIdentity)

    const devices = await IIConnection.lookupAuthenticators(userNumber)
    const multiIdent = getMultiIdent(devices)

    return {
      kind: "loginSuccess",
      userNumber,
      chain,
      sessionKey,
      internetIdentity: new IIConnection(
        // eslint-disable-next-line
        multiIdent._actualIdentity!,
        delegationIdentity,
        actor,
      ),
      identityManager: await this.createServiceActor<IdentityManagerService>(
        delegationIdentity,
        IdentityManagerIdlFactory,
        IDENTITY_MANAGER_CANISTER_ID,
      ),
      pubsubChannelActor: await this.createServiceActor<PubsubChannelService>(
        delegationIdentity,
        PubsubChannelIdlFactory,
        PUB_SUB_CHANNEL_CANISTER_ID,
      ),
      imAdditionActor: await this.createServiceActor<ImAdditionService>(
        delegationIdentity,
        ImAdditionIdlFactory,
        IM_ADDITION_CANISTER_ID,
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

    const actor = await IIConnection.createActor(
      delegationIdentity.delegationIdentity,
    )

    return {
      kind: "loginSuccess",
      userNumber,
      chain: delegationIdentity.chain,
      sessionKey: delegationIdentity.sessionKey,
      internetIdentity: new IIConnection(
        // eslint-disable-next-line
        multiIdent._actualIdentity!,
        delegationIdentity.delegationIdentity,
        actor,
      ),
      identityManager: await this.createServiceActor<IdentityManagerService>(
        delegationIdentity.delegationIdentity,
        IdentityManagerIdlFactory,
        IDENTITY_MANAGER_CANISTER_ID,
      ),
      pubsubChannelActor: await this.createServiceActor<PubsubChannelService>(
        delegationIdentity.delegationIdentity,
        PubsubChannelIdlFactory,
        PUB_SUB_CHANNEL_CANISTER_ID,
      ),
      imAdditionActor: await this.createServiceActor<ImAdditionService>(
        delegationIdentity.delegationIdentity,
        ImAdditionIdlFactory,
        IM_ADDITION_CANISTER_ID,
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
    const actor = await IIConnection.createActor(
      delegationIdentity.delegationIdentity,
    )

    return {
      kind: "loginSuccess",
      userNumber,
      chain: delegationIdentity.chain,
      sessionKey: delegationIdentity.sessionKey,
      internetIdentity: new IIConnection(
        identity,
        delegationIdentity.delegationIdentity,
        actor,
      ),
      identityManager: await this.createServiceActor<IdentityManagerService>(
        delegationIdentity.delegationIdentity,
        IdentityManagerIdlFactory,
        IDENTITY_MANAGER_CANISTER_ID,
      ),
      pubsubChannelActor: await this.createServiceActor<PubsubChannelService>(
        delegationIdentity.delegationIdentity,
        PubsubChannelIdlFactory,
        PUB_SUB_CHANNEL_CANISTER_ID,
      ),
      imAdditionActor: await this.createServiceActor<ImAdditionService>(
        delegationIdentity.delegationIdentity,
        ImAdditionIdlFactory,
        IM_ADDITION_CANISTER_ID,
      ),
    }
  }

  static async lookupAll(userNumber: UserNumber): Promise<DeviceData[]> {
    return await baseActor.lookup(userNumber)
  }

  static async createChallenge(): Promise<Challenge> {
    const actor = await this.createActor()
    const challenge = await actor.create_challenge()
    return challenge
  }

  static async lookupAuthenticators(
    userNumber: UserNumber,
    withSecurityDevices?: boolean,
  ): Promise<DeviceData[]> {
    const allDevices = await baseActor.lookup(userNumber)

    return allDevices.filter((device) =>
      withSecurityDevices
        ? true
        : hasOwnProperty(device.purpose, "authentication"),
    )
  }

  static async lookupRecovery(userNumber: UserNumber): Promise<DeviceData[]> {
    const allDevices = await baseActor.lookup(userNumber)
    return allDevices.filter((device) =>
      hasOwnProperty(device.purpose, "recovery"),
    )
  }

  // Create an actor representing the backend
  static async createActor(
    delegationIdentity?: DelegationIdentity,
  ): Promise<ActorSubclass<_SERVICE>> {
    const agent = new HttpAgent({
      host: IC_HOST,
      identity: delegationIdentity,
    })

    // Only fetch the root key when we're not in prod
    if (II_ENV === "development") {
      await agent.fetchRootKey()
    }
    const actor = Actor.createActor<_SERVICE>(internet_identity_idl, {
      agent,
      canisterId: INTERNET_IDENTITY_CANISTER_ID,
    })
    return actor
  }

  static async createServiceActor<T>(
    delegationIdentity: DelegationIdentity,
    factory: any,
    INTERNET_IDENTITY_CANISTER_ID: string,
  ): Promise<ActorSubclass<T>> {
    const agent = new HttpAgent({
      host: IC_HOST,
      identity: delegationIdentity,
    })

    // Only fetch the root key when we're not in prod
    if (II_ENV === "development") {
      await agent.fetchRootKey()
    }
    const actor = Actor.createActor<T>(factory, {
      agent,
      canisterId: INTERNET_IDENTITY_CANISTER_ID,
    })
    return actor
  }

  async getActor(): Promise<ActorSubclass<_SERVICE>> {
    for (const { delegation } of this.delegationIdentity.getDelegation()
      .delegations) {
      // prettier-ignore
      if (+new Date(Number(delegation.expiration / BigInt(1000000))) <= +Date.now()) {
        this.actor = undefined;
        break;
      }
    }

    if (this.actor === undefined) {
      // Create our actor with a DelegationIdentity to avoid re-prompting auth
      this.delegationIdentity = (
        await requestFEDelegation(this.identity)
      ).delegationIdentity
      this.actor = await IIConnection.createActor(this.delegationIdentity)
    }

    return this.actor
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
    credentialId?: BinaryBlob,
  ): Promise<void> => {
    const actor = await this.getActor()
    return await actor.add(userNumber, {
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
    const actor = await this.getActor()
    await actor.remove(userNumber, publicKey)
  }

  getPrincipal = async (
    userNumber: UserNumber,
    frontend: FrontendHostname,
  ): Promise<Principal> => {
    const actor = await this.getActor()
    return await actor.get_principal(userNumber, frontend)
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
    const actor = await this.getActor()
    return await actor.prepare_delegation(
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
    const actor = await this.getActor()
    return await actor.get_delegation(
      userNumber,
      hostname,
      sessionKey,
      timestamp,
    )
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
      targets: [
        Principal.from(INTERNET_IDENTITY_CANISTER_ID),
        Principal.from(IDENTITY_MANAGER_CANISTER_ID),
        Principal.from(PUB_SUB_CHANNEL_CANISTER_ID),
        Principal.from(IM_ADDITION_CANISTER_ID),
      ],
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
  derBlobFromBlob(blobFromUint8Array(Buffer.from(pubkey)))

const getMultiIdent = (
  devices: DeviceData[],
  withSecurityDevices?: boolean,
) => {
  return MultiWebAuthnIdentity.fromCredentials(
    devices.flatMap((device) =>
      device.credential_id.map((credentialId: CredentialId) => ({
        pubkey: derFromPubkey(device.pubkey),
        credentialId: blobFromUint8Array(Buffer.from(credentialId)),
      })),
    ),
    withSecurityDevices,
  )
}
