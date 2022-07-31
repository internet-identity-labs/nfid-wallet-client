// Fetch + idiomatic sanitization layer for the identity manager canister.
import { Principal } from "@dfinity/principal"

import { NFIDPersona } from "frontend/integration/identity-manager/persona/types"

import { unpackLegacyResponse, unpackResponse } from "../_common"
import {
  AccessPointResponse,
  AccountResponse,
  Application as BEApplication,
  PersonaResponse,
} from "../_ic_api/identity_manager.did"
import { im } from "../actors"

export interface Profile {
  name?: string
  anchor: number
  accessPoints: AccessPoint[]
  accounts: Account[]
  principalId: string
  phoneNumber?: string
}

export interface AccessPoint {
  icon: string
  device: string
  browser: string
  lastUsed: number
  principalId: string
}

export interface Account {
  domain: string
  label: string
  accountId: string
}

/**
 * Sanitize im.get_account response from canister into our internal profile representation
 * @param profile {@link AccountResponse} Account response from canister
 * @returns {@link Account}
 */
export function mapProfile(profile: AccountResponse): Profile {
  console.debug("mapAccount", { account: profile })
  return {
    name: profile.name.length ? profile.name[0] : undefined,
    anchor: Number(profile.anchor),
    accessPoints: profile.access_points.map(mapAccessPoint),
    accounts: profile.personas.map(mapAccount),
    principalId: profile.principal_id,
    phoneNumber: profile.name.length ? profile.name[0] : undefined,
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
    icon: accessPoint.icon,
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
 * selects all accounts by 3rd party app domain
 */
export function selectAccounts(personas: Account[], domain: string) {
  return personas.filter((p) => p.domain === domain)
}

export async function createPersona(
  domain: string,
  personaId: string,
  personaName: string,
) {
  console.debug("createPersona", { domain, personaId, personaName })
  return await im
    .create_persona({
      domain,
      persona_id: personaId,
      persona_name: personaName,
    })
    .then((response) => {
      console.debug("createPersona", { response })
      return response
    })
    .then((r) => mapProfile(unpackResponse(r)))
}

/**
 * ?
 */
export async function verifyToken(token: string, principal: Principal) {
  return im
    .verify_token(token)
    .then(unpackLegacyResponse)
    .catch((e) => {
      throw new Error(`verifyToken im.verify_token: ${e.message}`)
    })
}

/**
 * Updates the last used timestamp on the used device from the actor
 */
export async function useAccessPoint() {
  return await im
    .use_access_point()
    .then(unpackResponse)
    .then((r) => r.map(mapAccessPoint))
}

export async function registerAccount(anchor: number) {
  return im
    .create_account({ anchor: BigInt(anchor) })
    .then(unpackResponse)
    .then(mapProfile)
}

export interface Application {
  accountLimit: number
  domain: string
  name: string
}

function mapApplication(application: BEApplication): Application {
  if (application.user_limit < 1)
    throw new Error(`mapApplication user_limit has to be greater or equal to 1`)

  return {
    accountLimit: application.user_limit,
    domain: application.domain,
    name: application.name,
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
