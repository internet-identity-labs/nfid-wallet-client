import { useAtom } from "jotai"
import React from "react"
import { useParams } from "react-router-dom"

import { useAuthorization } from "frontend/apps/authorization/use-authorization"
import { PersonaRequest } from "frontend/integration/_ic_api/identity_manager.did"
import { im } from "frontend/integration/actors"
import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { useIsLoading } from "frontend/ui/templates/app-screen/use-is-loading"

import { Account } from ".."
import { personaAtom } from "./state"
import { isNFIDPersona } from "./types"
import { createAccount, getNextAccountId, selectAccounts } from "./utils"

/**
 *
 * @deprecated FIXME: move to integration layer
 * */
export const usePersona = () => {
  const [personas, setPersonas] = useAtom(personaAtom)
  const { scope } = useParams()
  const { isLoading } = useIsLoading()
  const { authorizationRequest } = useAuthorization()
  const { profile } = useAccount()

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
    () => getNextAccountId(accounts),
    [accounts],
  )

  const getPersona = React.useCallback(async () => {
    const response = await im.read_personas().catch((e) => {
      throw new Error(`usePersona.getPersona im.read_personas: ${e.message}`)
    })

    if (response.status_code === 200) {
      setPersonas(response.data[0])
    }
    // NOTE: this is only for dev purposes
    if (response.status_code === 404 && profile?.anchor) {
      const anchor = BigInt(profile?.anchor)
      await im
        .create_account({
          anchor,
        })
        .catch((e) => {
          throw new Error(
            `usePersona.getPersona im.create_account: ${e.message}`,
          )
        })

      getPersona()
    }
  }, [profile?.anchor, setPersonas])

  const createPersona = React.useCallback(
    async ({ domain }: { domain: string }) => {
      const newAccount: Account = createAccount(
        accounts,
        domain,
        authorizationRequest?.derivationOrigin,
      )

      const accountParams: PersonaRequest = {
        persona_name: newAccount.label,
        persona_id: newAccount.accountId,
        domain: newAccount.domain,
      }

      const response = await im.create_persona(accountParams).catch((e) => {
        throw new Error(
          `usePersona.createPersona im.create_access_point: ${e.message}`,
        )
      })

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
