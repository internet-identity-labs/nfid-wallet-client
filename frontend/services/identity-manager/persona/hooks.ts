import produce from "immer"
import React from "react"
import { PERSONA_LOCAL_STORAGE_KEY } from "./constants"
import { Persona } from "./types"

interface UsePersona {
  application?: string
}

// personas: [{"principal_id": "1", "application": "localhost:3000"}]

export const usePersona = ({ application }: UsePersona = {}) => {
  const [personas, setPersonas] = React.useState<Persona[] | null>(null)

  React.useEffect(() => {
    personas &&
      localStorage.setItem(PERSONA_LOCAL_STORAGE_KEY, JSON.stringify(personas))
  }, [personas])

  const getPersona = React.useCallback(async () => {
    const personaFromLS = localStorage.getItem(PERSONA_LOCAL_STORAGE_KEY)
    const persona: Persona[] = personaFromLS ? JSON.parse(personaFromLS) : null

    return new Promise<Persona[]>((resolve) => resolve(persona))
  }, [])

  const updatePersona = React.useCallback(
    (partialPersona: Partial<Persona>) => {
      const newPersona = produce(personas, (draft: Persona) => ({
        ...draft,
        ...partialPersona,
      }))
      setPersonas(newPersona)
    },
    [personas],
  )

  React.useEffect(() => {
    getPersona().then((persona) => setPersonas(persona))
  }, [getPersona])

  return {
    personas:
      application && personas
        ? personas.filter((p) => p.domain === application)
        : personas,
    getPersona,
    updatePersona,
  }
}
