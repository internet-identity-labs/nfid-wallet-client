import { useAtom } from "jotai"
import React from "react"
import { useParams } from "react-router-dom"

import { useAuthorization } from "frontend/apps/authorization/use-authorization"
<<<<<<< HEAD:src/integration/identity-manager/persona/hooks.ts
import { PersonaRequest } from "frontend/integration/_ic_api/identity_manager.did"
import { im } from "frontend/integration/actors"
import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { useIsLoading } from "frontend/ui/templates/app-screen/use-is-loading"
=======
import { im } from "frontend/integration/actors"
import { Persona } from "frontend/integration/actors/im"
import { PersonaRequest } from "frontend/integration/idl/identity_manager.did"
import { useAccount } from "frontend/integration/services/identity-manager/account/hooks"
>>>>>>> f6fa3cda (feat: phone credential verification):src/integration/services/identity-manager/persona/hooks.ts

import { Persona } from ".."
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
    async ({ domain }: { domain: string }) => {
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
