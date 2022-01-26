import produce from "immer"
import React from "react"
import { PERSONA_LOCAL_STORAGE_KEY } from "./constants"
import { Persona } from "./types"
import { _SERVICE as _IDENTITY_MANAGER_SERVICE } from "frontend/services/identity-manager/identity_manager"

type PersonaService = Pick<_IDENTITY_MANAGER_SERVICE, "create_persona">
interface UsePersona {
  application?: string
  personaService?: PersonaService
}

// personas: [{"principal_id": "1", "application": "localhost:3000"}]

export const usePersona = ({
  application,
  personaService,
}: UsePersona = {}) => {
  // const { isAuthenticated, identityManager } = useAuthentication()
  const [personas, setPersonas] = React.useState<Persona[] | null>(null)

  // console.log(">> ", { isAuthenticated })

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

  const createPersona = React.useCallback(
    async ({ domain, personaId: persona_id }) => {
      const response = await personaService?.create_persona({
        nfid_persona: { domain, persona_id },
      })
      console.log(">> ", { response })
    },
    [],
  )

  React.useEffect(() => {
    getPersona().then((persona) => setPersonas(persona))
  }, [getPersona])

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
