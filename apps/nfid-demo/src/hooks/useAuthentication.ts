import { DelegationIdentity } from "@dfinity/identity"
import React from "react"

import { useAuthenticationContext } from "../context/authentication"
import { useButtonState } from "./useButtonState"

export const useAuthentication = () => {
  const { nfid, identity, setIdentity } = useAuthenticationContext()
  const [error, setError] = React.useState<string>()

  const [authButton, updateAuthButton] = useButtonState({
    label: "Authenticate",
  })

  const derivationOrigin = React.useMemo(() => {
    const origin = window.location.origin
    const isDerivationOrigin = origin.includes(".raw")
    return isDerivationOrigin
      ? window.location.origin.replace(".raw", "")
      : undefined
  }, [])

  React.useEffect(() => {
    if (nfid?.isAuthenticated) {
      const identity = nfid.getIdentity()
      updateAuthButton({ label: "Logout" })
      setIdentity(identity as unknown as DelegationIdentity)
    }
  }, [nfid, setIdentity, updateAuthButton])

  const handleAuthenticate = React.useCallback(
    async (targets: string[]) => {
      setError(undefined)
      if (!nfid) throw new Error("NFID not initialized")

      console.debug("handleAuthenticate", { targets })
      updateAuthButton({ loading: true, label: "Authenticating..." })
      try {
        const identity = await nfid.getDelegation({
          ...(targets.length ? { targets } : {}),
          ...(derivationOrigin ? { derivationOrigin } : {}),
        })
        setIdentity(identity as unknown as DelegationIdentity)
        updateAuthButton({ loading: false, label: "Logout" })
        return identity
      } catch (error: any) {
        console.debug("handleAuthenticate", { error })
        updateAuthButton({ loading: false, label: "Authenticate" })
        setError(error)
        return
      }
    },
    [derivationOrigin, nfid, setIdentity, updateAuthButton],
  )

  return {
    identity,
    setIdentity,
    error,
    setError,
    nfid,
    authButton,
    updateAuthButton,
    handleAuthenticate,
  }
}
