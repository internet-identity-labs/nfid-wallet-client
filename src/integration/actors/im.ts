// Fetch + idiomatic sanitization layer for the identity manager canister.
import { Principal } from "@dfinity/principal"

<<<<<<< HEAD:src/integration/identity-manager/index.ts
import { NFIDPersona } from "frontend/integration/identity-manager/persona/types"

import { unpackLegacyResponse, unpackResponse } from "../_common"
=======
import { im } from "."
>>>>>>> f6fa3cda (feat: phone credential verification):src/integration/actors/im.ts
import {
  AccessPointResponse,
  AccountResponse,
  Application as BEApplication,
  PersonaResponse,
<<<<<<< HEAD:src/integration/identity-manager/index.ts
} from "../_ic_api/identity_manager.did"
import { im } from "../actors"
=======
} from "../idl/identity_manager.did"
import { unpackLegacyResponse, unpackResponse } from "./.common"

/**
 * - [ ] Each task applies to all participants in the phone credential flow
 *      - [ ] Identity Manager
 *      - [ ] Internet Identity
 *      - [ ] NFID Verifier
 *      - [ ] Lambda
 * - [ ] Create fetch methods to wrap all api/canister calls in phone credential flow
 * - [ ] Create map methods to sanitize canister calls into idiomatic data objects
 * - [ ] Create map methods for common data types (dates, etc)
 *      - [ ] Create unwrapper for the backend guys' http response paradigm into properly typed code
 * - [ ] Architect ui and control flow pattern
 * - [ ] Build the authentication flow
 * - [ ] Add the delegate parameter to the SDK
 * - [ ]
 */

// NOTE: Most of the mapping involves predictable updates. Automate?
// - idiomatic naming (snake_case to camelCase)
// - recasting as a new type
//  - [] | [value] to optional
//  - bigint to number
//  - removing extra date decimals
>>>>>>> f6fa3cda (feat: phone credential verification):src/integration/actors/im.ts

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
<<<<<<< HEAD:src/integration/identity-manager/index.ts
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
=======
>>>>>>> f6fa3cda (feat: phone credential verification):src/integration/actors/im.ts
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
<<<<<<< HEAD:src/integration/identity-manager/index.ts
 */
export async function fetchAccount() {
  return await im.get_account().then((r) => mapAccount(unpackResponse(r)))
}

/**
 * Fetch personas for the currently connected principal.
=======
>>>>>>> f6fa3cda (feat: phone credential verification):src/integration/actors/im.ts
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
  return await im
    .create_persona({
      domain,
      persona_id: personaId,
      persona_name: personaName,
    })
    .then((r) => mapAccount(unpackResponse(r)))
}

/**
 * Verify SMS token that was issued to current user's phone number. Returns true or throws error.
 */
export async function verifyToken(token: string) {
  return await im.verify_token(token).then(unpackLegacyResponse)
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
  return im
    .read_applications()
    .then(unpackResponse)
    .then((r) => r.map(mapApplication))
}
