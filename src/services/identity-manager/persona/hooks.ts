import { useAtom } from "jotai"
import React from "react"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { useAccount } from "frontend/services/identity-manager/account/hooks"

import { personaAtom } from "./state"
import { isNFIDPersona, isIIPersona } from "./types"

interface UsePersona {
  application?: string
}

export const usePersona = ({ application }: UsePersona = {}) => {
  const [personas, setPersonas] = useAtom(personaAtom)
  const { isLoading } = useIsLoading()
  const { identityManager: personaService } = useAuthentication()
  const { account } = useAccount()

  const nfidPersonas = React.useMemo(() => {
    if (!personas) return []
    return personas.filter(isNFIDPersona)
  }, [personas])

  const iiPersonas = React.useMemo(() => {
    if (!personas) return []
    return personas.filter(isIIPersona)
  }, [personas])

  const nextPersonaId = React.useMemo(() => {
    const highest = nfidPersonas.reduce((last, persona) => {
      const current = parseInt(persona.persona_id, 10)
      return last < current ? current : last
    }, 0)
    return `${highest + 1}`
  }, [nfidPersonas])

  const getPersona = React.useCallback(async () => {
    if (!personaService) return
    const response = await personaService.read_personas()

    if (response.status_code === 200) {
      setPersonas(response.data[0])
    }
    // NOTE: this is only for dev purposes
    if (response.status_code === 404 && account?.anchor) {
      const anchor = BigInt(account?.anchor)
      await personaService.create_account({
        anchor,
      })

      getPersona()
    }
  }, [account?.anchor, personaService, setPersonas])

  const createPersona = React.useCallback(
    async ({ domain }) => {
      if (!account) throw new Error('"account" is required')

      const persona = { domain, persona_id: nextPersonaId, persona_name: "" }

      const response = await personaService?.create_persona(persona)

      if (response?.status_code === 200) {
        setPersonas(response.data[0]?.personas)
      }
      return response
    },
    [account, nextPersonaId, personaService, setPersonas],
  )

  return {
    isLoadingPersonas: isLoading,
    nfidPersonas,
    iiPersonas,
    personas:
      application && personas
        ? personas.filter((p) => p.domain === application)
        : personas,
    nextPersonaId,
    createPersona,
    getPersona,
  }
}
