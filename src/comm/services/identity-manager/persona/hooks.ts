import { useAtom } from "jotai"
import React from "react"
import { useParams } from "react-router-dom"

import { useIsLoading } from "frontend/design-system/templates/app-screen/use-is-loading"

import { useAuthorization } from "frontend/apps/authorization/use-authorization"
import { im } from "frontend/comm/actors"
import { PersonaRequest } from "frontend/comm/idl/identity_manager.did"
import { Persona } from "frontend/comm/im"
import { useAccount } from "frontend/comm/services/identity-manager/account/hooks"

import { personaAtom } from "./state"
import { isNFIDPersona } from "./types"
import { createAccount, getNextPersonaId, selectAccounts } from "./utils"

export const usePersona = () => {
  const [personas, setPersonas] = useAtom(personaAtom)
  const { scope } = useParams()
  const { isLoading } = useIsLoading()
  const { authorizationRequest } = useAuthorization()
  const { account } = useAccount()

  const allAccounts = React.useMemo(() => {
    if (!personas) return []
    return personas.filter(isNFIDPersona)
  }, [personas])

  const accounts = React.useMemo(() => {
    if (!allAccounts || !authorizationRequest) return []

    const { hostname, derivationOrigin } = authorizationRequest
    return selectAccounts(allAccounts, scope || hostname, derivationOrigin)
  }, [allAccounts, authorizationRequest, scope])

  const nextPersonaId = React.useMemo(
    () => getNextPersonaId(accounts),
    [accounts],
  )

  const getPersona = React.useCallback(async () => {
    const response = await im.read_personas()

    if (response.status_code === 200) {
      setPersonas(response.data[0])
    }
    // NOTE: this is only for dev purposes
    if (response.status_code === 404 && account?.anchor) {
      const anchor = BigInt(account?.anchor)
      await im.create_account({
        anchor,
      })

      getPersona()
    }
  }, [account?.anchor, setPersonas])

  const createPersona = React.useCallback(
    async ({ domain }) => {
      const persona: Persona = createAccount(
        accounts,
        domain,
        authorizationRequest?.derivationOrigin,
      )

      const personaCredentials: PersonaRequest = {
        persona_name: persona.personaName,
        persona_id: persona.personaId,
        domain: persona.domain,
      }

      const response = await im.create_persona(personaCredentials)

      if (response?.status_code === 200) {
        setPersonas(response.data[0]?.personas)
      }
      return response
    },
    [accounts, authorizationRequest?.derivationOrigin, setPersonas],
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
