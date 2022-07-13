// Fetch + idiomatic sanitization layer for the identity manager canister.
import { Principal } from "@dfinity/principal"

import { NFIDPersona } from "frontend/comm/services/identity-manager/persona/types"

import { unpackLegacyResponse, unpackResponse } from "../../comm/.common"
import { im } from "../../comm/actors"
import {
  AccessPointResponse,
  AccountResponse,
  PersonaResponse,
} from "../../comm/idl/identity_manager.did"

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
  return im.get_account().then((r) => mapAccount(unpackResponse(r)))
}

/**
 * ?
 */
export async function verifyToken(token: string, principal: Principal) {
  return im.verify_token(token).then(unpackLegacyResponse)
}
