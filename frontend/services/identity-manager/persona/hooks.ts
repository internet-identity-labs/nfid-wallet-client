import produce from "immer"
import React from "react"
import { _SERVICE as _IDENTITY_MANAGER_SERVICE } from "frontend/services/identity-manager/identity_manager"
import { useAtom } from "jotai"
import { personaAtom } from "./state"
import { Persona } from "./types"

type PersonaService = Pick<_IDENTITY_MANAGER_SERVICE, "create_persona">
interface UsePersona {
  application?: string
  personaService?: PersonaService
}

export const usePersona = ({
  application,
  personaService,
}: UsePersona = {}) => {
  const [personas, setPersonas] = useAtom(personaAtom)

  const getPersona = React.useCallback(async () => {
    return new Promise<Persona[]>((resolve) => resolve(personas || []))
  }, [personas])

  const updatePersona = React.useCallback(
    (partialPersona: Partial<Persona>) => {
      const newPersona = produce(personas, (draft: Persona) => ({
        ...draft,
        ...partialPersona,
      }))
      setPersonas(newPersona)
    },
    [personas, setPersonas],
  )

  const createPersona = React.useCallback(
    async ({ domain, personaId: persona_id }) => {
      const response = await personaService?.create_persona({
        nfid_persona: { domain, persona_id },
      })
      console.log(">> ", { response })
    },
    [personaService],
  )

  React.useEffect(() => {
    getPersona().then((persona) => setPersonas(persona))
  }, [getPersona, setPersonas])

  return {
    personas:
      application && personas
        ? personas.filter((p) => p.domain === application)
        : personas,
    createPersona,
    getPersona,
    updatePersona,
  }
}
