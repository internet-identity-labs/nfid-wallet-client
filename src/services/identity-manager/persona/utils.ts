import { PersonaResponse } from "frontend/api/idl/identity_manager.did"

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
