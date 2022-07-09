// Fetch + idiomatic sanitization layer for the identity manager canister.
import { Principal } from "@dfinity/principal"
import useSWR from "swr"

import { unpackLegacyResponse, unpackResponse } from "./.common"
import { im } from "./actors"
import {
  AccessPointResponse,
  AccountResponse,
  PersonaResponse,
} from "./idl/identity_manager.did"

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
 * Generate an account stub.
 * @returns {@link Account}
 */
export function factoryAccount(principal?: Principal): Account {
  return {
    anchor: Math.floor(100_000 * Math.random()),
    accessPoints: new Array(Math.floor(Math.random() * 5)).fill(
      factoryAccessPoint(),
    ),
    personas: new Array(Math.floor(Math.random() * 5)).fill(
      factoryAccessPoint(),
    ),
    principalId: principal?.toText() || "",
    name: undefined,
    phoneNumber: undefined,
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
 * Generate a persona stub.
 * @returns {@link Persona}
 */
export function factoryPersona(principal?: Principal): Persona {
  return {
    domain: "",
    personaName: "",
    personaId: "",
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
 * Generate an access point stub.
 * @returns {@link AccessPoint}
 */
export function factoryAccessPoint(principal?: Principal): AccessPoint {
  return {
    icon: "string",
    device: "string",
    browser: "string",
    lastUsed: new Date().getTime(),
    principalId: "string",
  }
}

/**
 * Fetch account for the currently connected principal.
 */
export async function fetchAccount() {
  return im.get_account().then((r) => mapAccount(unpackResponse(r)))
}

export function useAccount() {
  return useSWR("account/fetch", fetchAccount, {
    dedupingInterval: 60_000,
    focusThrottleInterval: 60_000,
  })
}

/**
 * Verify SMS token that was issued to current user's phone number. Returns true or throws error.
 */
export async function verifyToken(token: string) {
  return await im.verify_token(token).then(unpackLegacyResponse)
}
