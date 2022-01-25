import produce from "immer"
import React from "react"
import { PERSONA_LOCAL_STORAGE_KEY } from "./constants"
import { Persona } from "./types"

export const usePersona = () => {
  const [persona, setPersona] = React.useState<Persona | null>(null)

  React.useEffect(() => {
    persona &&
      localStorage.setItem(PERSONA_LOCAL_STORAGE_KEY, JSON.stringify(persona))
  }, [persona])

  const getPersona = React.useCallback(async () => {
    const personaFromLS = localStorage.getItem(PERSONA_LOCAL_STORAGE_KEY)
    const persona: Persona = personaFromLS ? JSON.parse(personaFromLS) : null
    return new Promise<Persona | null>((resolve) => resolve(persona))
  }, [])

  const updatePersona = React.useCallback(
    (partialPersona: Partial<Persona>) => {
      const newPersona = produce(persona, (draft: Persona) => ({
        ...draft,
        ...partialPersona,
      }))
      setPersona(newPersona)
    },
    [persona],
  )

  React.useEffect(() => {
    getPersona().then((persona) => setPersona(persona))
  }, [getPersona])

  return { persona, getPersona, updatePersona }
}
