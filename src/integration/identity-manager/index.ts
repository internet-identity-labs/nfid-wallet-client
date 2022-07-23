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
import { authState } from "../internet-identity"

export interface Account {
  name?: string
  anchor: number
  accessPoints: AccessPoint[]
  personas: Persona[]
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

export interface Persona {
  domain: string
  personaName: string
  personaId: string
}

/**
 * Sanitize account response from canister into our internal representation
 * @param account {@link AccountResponse} Account response from canister
 * @returns {@link Account}
 */
function mapAccount(account: AccountResponse): Account {
  console.debug("mapAccount", { account })
  return {
    name: account.name.length ? account.name[0] : undefined,
    anchor: Number(account.anchor),
    accessPoints: account.access_points.map(mapAccessPoint),
    personas: account.personas.map(mapPersona),
    principalId: account.principal_id,
    phoneNumber: account.name.length ? account.name[0] : undefined,
  }
}

/**
 * Map a persona to a legacy persona type.
 * @deprecated
 */
export function mapPersonaToLegacy(persona: Persona): NFIDPersona {
  return {
    persona_id: persona.personaId,
    domain: persona.domain,
  }
}

/**
 * Sanitize persona response from canister into our internal representation
 * @param persona {@link PersonaResponse} Persona response from canister
 * @returns {@link Persona}
 */
function mapPersona(persona: PersonaResponse): Persona {
  return {
    domain: persona.domain,
    personaName: persona.persona_name,
    personaId: persona.persona_id,
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
export async function fetchAccount() {
  console.debug("fetchAccount")
  return await im
    .get_account()
    .then((response) => {
      console.debug("fetchAccount", { response })
      return response
    })
    .then((r) => mapAccount(unpackResponse(r)))
}

/**
 * Fetch personas for the currently connected principal.
 */
export async function fetchPersonas() {
  try {
    return await im
      .read_personas()
      .then(unpackResponse)
      .then((r) => r.map(mapPersona))
  } catch (e: any) {
    // This endpoint throws an error if there are no personas. Weird.
    if (e.name === "NfidHttpError") {
      return []
    }
    throw e
  }
}

export function selectPersonas(personas: Persona[], domain: string) {
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
    .then((r) => mapAccount(unpackResponse(r)))
}

/**
 * ?
 */
export async function verifyToken(token: string, principal: Principal) {
  return im.verify_token(token).then(unpackLegacyResponse)
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
  return im.create_account({ anchor: BigInt(anchor) }).then(unpackResponse)
}

export interface Application {
  accountLimit: number
  domain: string
  name: string
}

function mapApplication(application: BEApplication): Application {
  if (application.user_limit < 1)
    throw new Error("user_limit has to be greater or equal to 1")

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
  console.debug("fetchApplications")
  return im
    .read_applications()
    .then(unpackResponse)
    .then((r) => r.map(mapApplication))
}
