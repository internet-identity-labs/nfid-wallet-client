import { PersonaResponse } from "frontend/comm/idl/identity_manager.did"
import { Persona } from "frontend/comm/im"

import {
  validateDerivationOrigin,
  ValidationResult,
} from "../../internet-identity/validateDerivationOrigin"
import { IIPersona, NFIDPersona, Persona as LegacyPersonas } from "./types"

export const normalizePersonas = (
  personas?: PersonaResponse[],
): LegacyPersonas[] => {
  if (!personas) return []

  return personas
    .map((persona: any) => {
      if (typeof persona.ii_persona !== "undefined") {
        return persona.ii_persona as IIPersona
      }
      return persona.nfid_persona as NFIDPersona
    })
    .filter(Boolean)
}

/**
 * Select accounts which pertain to given hostName. Uses dervitationOrigin exclusively if present.
 * @param personas List of personas to be filtered, retrieved from identity manager
 * @param hostName Host name of the connecting application i.e. "dscvr.one"
 * @param derivationOrigin Domain used to derive the delegation, allowing apps to use an alternate origin from the host name
 * @returns List of personas usable for the given domain
 */
export function selectAccounts(
  personas: NFIDPersona[],
  hostName: string,
  derivationOrigin?: string,
) {
  return []
}

export function getNextPersonaId(filteredPersonas: NFIDPersona[]) {
  const highest = filteredPersonas.reduce((last, persona) => {
    const current = parseInt(persona.persona_id, 10)
    return last < current ? current : last
  }, 0)
  return `${highest + 1}`
}

/**
 * Create a new persona/account, incrementing id based on # of existing accounts. Uses dervitationOrigin exclusively if present.
 * @param personas
 * @param hostName
 * @param derivationOrigin
 */
export function createAccount(
  personas: NFIDPersona[],
  hostName: string,
  derivationOrigin?: string,
): Persona {
  const filterPersonasByDomain = personas.filter(
    (persona) =>
      persona.domain === derivationOrigin || persona.domain === hostName,
  )
  const newPersonaId = getNextPersonaId(filterPersonasByDomain)

  const newPersona: Persona = {
    personaId: newPersonaId,
    personaName: `Account ${newPersonaId}`,
    domain: derivationOrigin ?? hostName,
  }

  return newPersona
}

export function getScope(hostName: string, personaId?: string) {
  // TODO: add https if no protocol is present
  return `${personaId && personaId !== "0" ? `${personaId}@` : ``}${hostName}`
}
