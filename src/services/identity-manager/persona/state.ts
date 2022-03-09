import { atomWithStorage } from "jotai/utils"
import { Persona } from "./types"

import { PERSONA_LOCAL_STORAGE_KEY } from "./constants"

// personas: [
//  {"principal_id": "1", "domain": "localhost:3000"}
//  {"anchor": "10002", "domain": "localhost:3000"}
// ]

export const personaAtom = atomWithStorage<Persona[] | undefined>(
  PERSONA_LOCAL_STORAGE_KEY,
  undefined,
)
