import { DelegationIdentity } from "@dfinity/identity"
import React from "react"
import { useFieldArray, useForm } from "react-hook-form"

import { useAuthenticationContext } from "../context/authentication"
import { useButtonState } from "./useButtonState"

export const useAuthentication = () => {
  const { nfid, identity, setIdentity } = useAuthenticationContext()
  const [error, setError] = React.useState<string>()

  const [authButton, updateAuthButton] = useButtonState({
    label: "Authenticate",
  })

  React.useEffect(() => {
    if (nfid?.isAuthenticated) {
      const identity = nfid.getIdentity()
      updateAuthButton({ label: "Logout" })
      setIdentity(identity as unknown as DelegationIdentity)
    }
  }, [nfid, setIdentity, updateAuthButton])

  const [renewDelegationButton, updateRenewDelegationButton] = useButtonState({
    label: "Renew Delegation",
  })
  const { control, register } = useForm<{
    items: { canisterId: string; id?: string }[]
  }>()
  const { fields, append, remove } = useFieldArray({
    rules: { minLength: 4 },
    control,
    name: "items", // This should match the name of your array field
  })

  const targetCanisterIds = React.useMemo(
    () => fields.map((field) => field.canisterId),
    [fields],
  )

  const handleAuthenticate = React.useCallback(async () => {
    setError(undefined)
    if (!nfid) throw new Error("NFID not initialized")

    console.debug("handleAuthenticate", { targetCanisterIds })
    updateAuthButton({ loading: true, label: "Authenticating..." })
    try {
      const identity = await nfid.getDelegation(
        targetCanisterIds.length ? { targets: targetCanisterIds } : undefined,
      )
      setIdentity(identity as unknown as DelegationIdentity)
      updateAuthButton({ loading: false, label: "Logout" })
      return identity
    } catch (error: any) {
      console.debug("handleAuthenticate", { error })
      updateAuthButton({ loading: false, label: "Authenticate" })
      setError(error)
    }
  }, [nfid, setIdentity, targetCanisterIds, updateAuthButton])

  const handleRenewDelegation = React.useCallback(async () => {
    setError(undefined)
    if (!nfid) throw new Error("NFID not initialized")

    console.debug("handleRenewDelegation")
    updateRenewDelegationButton({
      loading: true,
      label: "Refetching Delegation...",
    })
    try {
      const identity = await nfid.renewDelegation({
        targets: targetCanisterIds,
      })
      console.debug("handleRenewDelegation", { identity })
      setIdentity(identity as unknown as DelegationIdentity)
      return identity
    } catch (error: any) {
      console.debug("handleRenewDelegation", { error })
      setError(error.message)
    }
    updateRenewDelegationButton({ loading: false, label: "Renew Delegation" })
  }, [nfid, setIdentity, targetCanisterIds, updateRenewDelegationButton])

  return {
    identity,
    setIdentity,
    error,
    setError,
    nfid,
    fields,
    register,
    append,
    remove,
    authButton,
    targetCanisterIds,
    updateAuthButton,
    renewDelegationButton,
    updateRenewDelegationButton,
    handleAuthenticate,
    handleRenewDelegation,
  }
}
