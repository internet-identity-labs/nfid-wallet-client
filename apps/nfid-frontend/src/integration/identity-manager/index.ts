// Fetch + idiomatic sanitization layer for the identity manager canister.
import { SignIdentity } from "@dfinity/agent"
import { DelegationIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"

import {
  AccessPoint,
  AccessPointCommon,
  Account,
  Application,
  authState,
  DeviceType,
  hasOwnProperty,
  Icon,
  im,
  mapOptional,
  passkeyStorage,
  Profile,
  replaceActorIdentity,
  reverseMapOptional,
  RootWallet,
} from "@nfid/integration"

import { NFIDPersona } from "frontend/integration/identity-manager/persona/types"

import { unpackLegacyResponse, unpackResponse } from "../_common"
import {
  AccessPointRequest,
  AccessPointResponse,
  AccountResponse,
  Application as BEApplication,
  DeviceType as DeviceVariant,
  HTTPAccountRequest,
  PersonaResponse,
  WalletVariant,
} from "../_ic_api/identity_manager.d"
import { PublicKey } from "../_ic_api/internet_identity.d"

export interface CreateAccessPoint extends AccessPointCommon {
  pubKey: PublicKey
}
export interface CreatePasskeyAccessPoint extends AccessPointCommon {
  principal: string
  credential_id: [] | [string]
}

/**
 * Sanitize im.get_account response from canister into our internal profile representation
 * @param profile {@link AccountResponse} Account response from canister
 * @returns {@link Account}
 */
export function mapProfile(profile: AccountResponse): Profile {
  console.debug("mapAccount", { profile })
  return {
    name: mapOptional(profile.name),
    anchor: Number(profile.anchor),
    accessPoints: profile.access_points.map(mapAccessPoint),
    accounts: profile.personas.map(mapAccount),
    principalId: profile.principal_id,
    phoneNumber: mapOptional(profile.phone_number),
    wallet: walletResponseToWallet(profile.wallet),
    is2fa: profile.is2fa_enabled,
    email: mapOptional(profile.email),
  }
}

/**
 * Map a persona to a legacy persona type.
 * @deprecated
 */
export function mapPersonaToLegacy(persona: Account): NFIDPersona {
  return {
    persona_id: persona.accountId,
    domain: persona.domain,
  }
}

/**
 * Sanitize persona response from canister into our internal representation
 * @param persona {@link PersonaResponse} Persona response from canister
 * @returns {@link Persona}
 */
function mapAccount(persona: PersonaResponse): Account {
  return {
    domain: persona.domain,
    label: persona.persona_name,
    accountId: persona.persona_id,
  }
}

/**
 * Sanitize access point response from canister into our internal representation
 * @param persona {@link AccessPointResponse} Access point response from canister
 * @returns {@link Persona}
 */
function mapAccessPoint(accessPoint: AccessPointResponse): AccessPoint {
  return {
    deviceType: deviceTypeToDevice(accessPoint.device_type),
    icon: accessPoint.icon as Icon,
    device: accessPoint.device,
    browser: accessPoint.browser,
    lastUsed: Number(accessPoint.last_used),
    principalId: accessPoint.principal_id,
    credentialId: accessPoint.credential_id
      ? accessPoint.credential_id[0]
      : undefined,
  }
}

/**
 * Fetch account for the currently connected principal.
 */
export async function fetchProfile() {
  console.debug("fetchProfile im.get_account")
  return await im
    .get_account()
    .then((response) => {
      console.debug("fetchProfile im.get_account", { response })
      return response
    })
    .then((r) => {
      const profile = mapProfile(unpackResponse(r))
      console.debug("fetchProfile", { profile })
      return profile
    })
    .catch((e) => {
      // expected 404 handled upstream
      if (e.code === 404) {
        throw e
      }
      throw new Error(`fetchProfile im.get_account: ${e.message}`)
    })
}

/**
 * Fetch accounts for the currently connected principal.
 */
export async function fetchAccounts() {
  console.debug(`fetchAccounts im.read_personas`)
  try {
    return await im
      .read_personas()
      .then(unpackResponse)
      .then((r) => r.map(mapAccount))
      .catch((e) => {
        throw new Error(`fetchAccounts im.get_account: ${e.message}`)
      })
  } catch (e: any) {
    // TODO: This note based on an incorrect assumption. Remove.
    // This endpoint throws an error if there are no personas. Weird.
    if (e.name === "NfidHttpError") {
      return []
    }
    throw e
  }
}

/**
 * Removes http:// or https:// from input string
 *
 * @param {string} input
 */
export const rmProto = (input: string) => input.replace(/https?:\/\//, "")

/**
 * selects all accounts by 3rd party app domain
 */
export function selectAccounts(
  personas: Account[],
  domain: string,
  derivationOrigin?: string,
) {
  const filterBy = derivationOrigin ?? domain

  return personas.filter(({ domain }) => rmProto(domain) === rmProto(filterBy))
}

export async function createAccount(
  domain: string,
  personaId: string,
  personaName: string,
) {
  console.debug("createAccount", { domain, personaId, personaName })
  return await im
    .create_persona({
      domain,
      persona_id: personaId,
      persona_name: personaName,
    })
    .then((response) => {
      console.debug("createAccount", { response })
      return response
    })
    .then((r) => mapProfile(unpackResponse(r)))
    .catch((e) => {
      throw new Error(`createAccount im.create_persona: ${e.message}`)
    })
}

/**
 * Verify SMS token that was issued to current user's phone number. Returns true or throws error.
 */
export async function verifyToken(token: string) {
  return im
    .verify_token(token)
    .then(unpackLegacyResponse)
    .catch((e) => {
      throw new Error(`verifyToken im.verify_token: ${e.message}`)
    })
}

function mapToAccessPointRequest(
  accessPoint: CreateAccessPoint,
): AccessPointRequest {
  return {
    icon: accessPoint.icon,
    device: accessPoint.device,
    pub_key: Principal.selfAuthenticating(
      new Uint8Array(accessPoint.pubKey),
    ).toText(),
    browser: accessPoint.browser,
    device_type: deviceToDeviceVariant(accessPoint.deviceType),
    credential_id: [],
  }
}

export async function createAccessPoint(accessPoint: CreateAccessPoint) {
  return im
    .create_access_point(mapToAccessPointRequest(accessPoint))
    .then(unpackResponse)
    .then((r) => r.map(mapAccessPoint))
}

export async function createPasskeyAccessPoint(
  accessPoint: CreatePasskeyAccessPoint,
) {
  return im
    .create_access_point({
      ...accessPoint,
      device_type: deviceToDeviceVariant(accessPoint.deviceType),
      pub_key: accessPoint.principal,
      credential_id: accessPoint.credential_id,
    })
    .then(unpackResponse)
    .then((r) => r.map(mapAccessPoint))
}

export async function createProfile(anchor: number) {
  return im
    .create_account({
      anchor: BigInt(anchor),
      access_point: [],
      wallet: [],
      email: [],
      name: [],
      challenge_attempt: [],
    })
    .then(unpackResponse)
    .then(mapProfile)
}

export async function update2fa(state: boolean) {
  return im.update_2fa(state).then(mapProfile)
}

type CreateAccessPointProps = {
  delegationIdentity: DelegationIdentity | SignIdentity
  email?: string
  icon: Icon
  name?: string
  device?: string
  deviceType: DeviceType
  credentialId?: string
  devicePrincipal?: string
}

/**
 * create NFID profile registered without II
 * use email identity
 */
export async function createNFIDProfile(
  {
    delegationIdentity,
    email,
    icon,
    name,
    device,
    deviceType,
    credentialId,
    devicePrincipal,
  }: CreateAccessPointProps,
  challengeAttempt?: {
    challengeKey: string
    chars?: string
  },
) {
  await replaceActorIdentity(im, delegationIdentity)

  if (deviceType === DeviceType.Passkey && !credentialId) {
    throw new Error("Passkey deviceType requires credentialId")
  }

  if (
    (deviceType === DeviceType.Email || deviceType === DeviceType.Google) &&
    !email
  ) {
    throw new Error("Email/Google deviceType requires email")
  }

  const dd: AccessPointRequest = {
    icon: icon,
    device: device ?? deviceType,
    pub_key: devicePrincipal
      ? devicePrincipal
      : delegationIdentity.getPrincipal().toText(),
    browser: "",
    device_type:
      deviceType === DeviceType.InternetIdentity
        ? { InternetIdentity: null }
        : email
          ? { Email: null }
          : { Passkey: null },
    credential_id: credentialId ? [credentialId] : [],
  }

  const accountRequest: HTTPAccountRequest = {
    access_point: [dd],
    wallet: [{ NFID: null }],
    anchor: BigInt(0), //we will calculate new anchor on IM side
    email: email ? [email] : [],
    name: name ? [name] : [],
    challenge_attempt: challengeAttempt
      ? [
          {
            challenge_key: challengeAttempt.challengeKey,
            chars: challengeAttempt.chars ? [challengeAttempt.chars] : [],
          },
        ]
      : [],
  }

  const profile: Profile = await im
    .create_account(accountRequest)
    .then((response) => {
      console.debug("createNFIDProfile", { response })
      if (response.status_code !== 200) {
        throw Error("Unable to create account: " + response.error)
      }
      return response
    })
    .then((r) => mapProfile(unpackResponse(r)))
    .catch((e) => {
      throw new Error(`createProfile im.create_account: ${e.message}`)
    })

  return profile
}

/**
 * Setup a new profile for the given II anchor
 * and attach the accessPoint
 *
 * @export
 * @param {number} anchor
 * @param {CreateAccessPoint} accessPoint
 */
export async function registerProfileWithAccessPoint(
  anchor: number,
  accessPoint: CreateAccessPoint,
) {
  await createProfile(anchor)
  await createAccessPoint(accessPoint)
  return await fetchProfile()
}

export async function removeAccount() {
  im.remove_account()
}

export async function removeAccessPoint(devicePrincipal: string) {
  const device: AccessPointResponse | undefined = await im
    .get_account()
    .then((account) =>
      account.data[0]!.access_points.find(
        (ap) => ap.principal_id === devicePrincipal,
      ),
    )
  if (!device) {
    throw new Error(
      `Not able to find access point with principal: ${devicePrincipal}`,
    )
  }
  await im
    .remove_access_point({
      pub_key: devicePrincipal,
    })
    .catch((e) => {
      throw new Error(`Not able to remove ap: ${e.message}`)
    })
  if (
    device.credential_id.length > 0 &&
    device.credential_id[0] !== undefined
  ) {
    await passkeyStorage.remove_passkey(
      device.credential_id[0],
      authState.getUserIdData().anchor,
    )
  }
}

function mapApplication(application: BEApplication): Application {
  if (application.user_limit < 1)
    throw new Error(`mapApplication user_limit has to be greater or equal to 1`)

  return {
    domain: application.domain,
    name: application.name,
    logo: mapOptional(application.img),
  }
}

/**
 * Fetches 3rd party application meta data
 */
export async function fetchApplications(
  predicate?: (application: Application) => boolean,
) {
  console.debug(`fetchApplications`)
  return im
    .read_applications()
    .then(unpackResponse)
    .then((r) => r.map(mapApplication))
    .then((r) => (predicate ? r.filter(predicate) : r))
}

export async function fetchApplication(domain: string) {
  console.debug("fetchApplication", { domain })
  return im.get_application(domain).then(unpackResponse).then(mapApplication)
}

/**
 * Update 3rd party application configuration
 *
 * @param derivationOrigin - the canister url
 * @param aliasDomain - the nice application domain used instead of the canister url
 * @param applicationName - the application name provided by the 3rd party application developer
 */
export async function processApplicationOrigin(
  derivationOrigin: string,
  aliasDomain: string,
  applicationName?: string,
) {
  console.debug("processApplicationOrigin", {
    derivationOrigin,
    aliasDomain,
    applicationName,
  })
  const application = await im.get_application(derivationOrigin)
  if (
    application.data.length === 0 ||
    !application?.data[0]?.alias[0]?.includes(aliasDomain)
  ) {
    await im.update_application_alias(
      derivationOrigin,
      aliasDomain,
      reverseMapOptional(applicationName),
    )
  }
}

function walletResponseToWallet(response: WalletVariant): RootWallet {
  if (hasOwnProperty(response, "NFID")) {
    return RootWallet.NFID
  }
  if (hasOwnProperty(response, "II")) {
    return RootWallet.II
  }
  throw Error("Unexpected enum value")
}

function deviceTypeToDevice(response: DeviceVariant): DeviceType {
  if (hasOwnProperty(response, "Email")) {
    return DeviceType.Email
  }
  if (hasOwnProperty(response, "Passkey")) {
    return DeviceType.Passkey
  }
  if (hasOwnProperty(response, "Unknown")) {
    return DeviceType.Unknown
  }
  if (hasOwnProperty(response, "Recovery")) {
    return DeviceType.Recovery
  }
  if (hasOwnProperty(response, "Password")) {
    return DeviceType.Password
  }
  if (hasOwnProperty(response, "InternetIdentity")) {
    return DeviceType.InternetIdentity
  }
  throw Error("Unexpected enum value")
}

function deviceToDeviceVariant(dt: DeviceType): DeviceVariant {
  switch (dt) {
    case DeviceType.Email:
      return { Email: null }
    case DeviceType.Passkey:
      return { Passkey: null }
    case DeviceType.Recovery:
      return { Recovery: null }
    case DeviceType.Unknown:
      return { Unknown: null }
  }
  throw Error("Unexpected enum value")
}
