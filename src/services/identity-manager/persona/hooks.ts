import { useAtom } from "jotai"
import React from "react"
import { useParams } from "react-router-dom"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAuthorization } from "frontend/hooks/use-authorization"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { useAccount } from "frontend/services/identity-manager/account/hooks"

import { personaAtom } from "./state"
import { isNFIDPersona } from "./types"

export const usePersona = () => {
  const [personas, setPersonas] = useAtom(personaAtom)
  const { scope } = useParams()
  const { isLoading } = useIsLoading()
  const { identityManager: personaService } = useAuthentication()
  const { authorizationRequest } = useAuthorization()
  const { account } = useAccount()

  const allAccounts = React.useMemo(() => {
    if (!personas) return []
    return personas.filter(isNFIDPersona)
  }, [personas])

  const accounts = React.useMemo(() => {
    if (!allAccounts) return []
    return allAccounts.filter(({ domain }) => {
      if (!authorizationRequest?.hostname && scope) {
        const applicationDomain = `${window.location.protocol}//${scope}`
        const isMatch = applicationDomain.indexOf(domain) > -1
        return isMatch
      }
      return (
        authorizationRequest?.hostname &&
        authorizationRequest.hostname.indexOf(domain) > -1
      )
    })
  }, [allAccounts, authorizationRequest?.hostname, scope])

  const nextPersonaId = React.useMemo(() => {
    const highest = allAccounts.reduce((last, persona) => {
      const current = parseInt(persona.persona_id, 10)
      return last < current ? current : last
    }, 0)
    return `${highest + 1}`
  }, [allAccounts])

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
    allAccounts,
    accounts,
    nextPersonaId,
    createPersona,
    getPersona,
  }
}
