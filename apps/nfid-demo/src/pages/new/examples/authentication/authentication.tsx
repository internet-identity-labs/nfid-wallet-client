import React from "react"

import { Button } from "@nfid-frontend/ui"

import { useAuthentication } from "../../../../hooks/useAuthentication"
import { AuthenticationForm } from "./target-canister-from"

export const Authentication = () => {
  const {
    setError,
    nfid,
    setIdentity,
    updateAuthButton,
    authButton,
    handleAuthenticate,
  } = useAuthentication()

  const handleLogout = React.useCallback(async () => {
    setError(undefined)
    if (!nfid) throw new Error("NFID not initialized")

    await nfid.logout()
    setIdentity(undefined)
    updateAuthButton({
      disabled: false,
      loading: false,
      label: "Authenticate",
    })
  }, [nfid, setError, setIdentity, updateAuthButton])

  return nfid?.isAuthenticated ? (
    <Button className="h-10" isSmall onClick={handleLogout}>
      Logout
    </Button>
  ) : (
    <AuthenticationForm
      submitButtonId="buttonAuthenticate"
      submitButtonText={"Authenticate"}
      isLoading={authButton.loading}
      onSubmit={handleAuthenticate}
    />
  )
}
