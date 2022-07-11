import { PersonaResponse } from "frontend/comm/idl/identity_manager.did"

import { IIPersona, NFIDPersona, Persona } from "./types"

export const normalizePersonas = (personas?: PersonaResponse[]): Persona[] => {
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
 *
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
