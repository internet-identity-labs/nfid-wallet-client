// Fetch + idiomatic sanitization layer for the identity manager canister.
import { DeviceKey } from "frontend/integration/_ic_api/internet_identity_types"
import { NFIDPersona } from "frontend/integration/identity-manager/persona/types"

import {
  mapOptional,
  reverseMapOptional,
  unpackLegacyResponse,
  unpackResponse,
} from "../_common"
import {
  AccessPointRequest,
  AccessPointResponse,
  AccountResponse,
  Application as BEApplication,
  PersonaResponse,
} from "../_ic_api/identity_manager.did"
import { PublicKey } from "../_ic_api/internet_identity_types"
import { im } from "../actors"
import { Icon } from "./devices/state"

export interface Profile {
  name?: string
  anchor: number
  accessPoints: AccessPoint[]
  accounts: Account[]
  principalId: string
  phoneNumber?: string
}

export interface AccessPointCommon {
  icon: Icon
  device: string
  browser: string
}

export interface CreateAccessPoint extends AccessPointCommon {
  pubKey: PublicKey
}

export interface AccessPoint extends AccessPointCommon {
  lastUsed: number
  principalId: string
}

export interface Account {
  domain: string
  label: string
  accountId: string
  icon?: string
  alias?: string[]
  accountCount?: number
}

/**
 * Sanitize im.get_account response from canister into our internal profile representation
 * @param profile {@link AccountResponse} Account response from canister
 * @returns {@link Account}
 */
export function mapProfile(profile: AccountResponse): Profile {
  console.debug("mapAccount", { account: profile })
  return {
    name: mapOptional(profile.name),
    anchor: Number(profile.anchor),
    accessPoints: profile.access_points.map(mapAccessPoint),
    accounts: profile.personas.map(mapAccount),
    principalId: profile.principal_id,
    phoneNumber: mapOptional(profile.phone_number),
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
    icon: accessPoint.icon as Icon,
    device: accessPoint.device,
    browser: accessPoint.browser,
    lastUsed: Number(accessPoint.last_used),
    principalId: accessPoint.principal_id,
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
    .then((r) => mapProfile(unpackResponse(r)))
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
    pub_key: accessPoint.pubKey,
    browser: accessPoint.browser,
  }
}

export async function createAccessPoint(accessPoint: CreateAccessPoint) {
  return im
    .create_access_point(mapToAccessPointRequest(accessPoint))
    .then(unpackResponse)
    .then((r) => r.map(mapAccessPoint))
}

async function createProfile(anchor: number) {
  return im
    .create_account({ anchor: BigInt(anchor) })
    .then(unpackResponse)
    .then(mapProfile)
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

export async function removeAccessPoint(pubkey: DeviceKey) {
  await im.remove_access_point({ pub_key: pubkey }).catch((e) => {
    throw new Error(`Not able to remove ap: ${e.message}`)
  })
}

export interface Application {
  accountLimit: number
  domain: string
  name: string
  icon?: string
  alias: string[]
  isNftStorage: boolean
}

function mapApplication(application: BEApplication): Application {
  if (application.user_limit < 1)
    throw new Error(`mapApplication user_limit has to be greater or equal to 1`)

  return {
    accountLimit: application.user_limit,
    domain: application.domain,
    name: application.name,
    icon: application.img[0],
    alias: application.alias.map((a) => a[0]),
    isNftStorage: !!mapOptional(application.is_nft_storage),
  }
}

/**
 * Fetches 3rd party application meta data
 */
export async function fetchApplications() {
  console.debug(`fetchApplications`)
  return im
    .read_applications()
    .then(unpackResponse)
    .then((r) => r.map(mapApplication))
}

/**
 * Update 3rd party application origin is needed
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
  let application = await im.get_application(derivationOrigin)
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
