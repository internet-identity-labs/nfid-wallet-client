import React from "react"
import { ImSpinner } from "react-icons/im"

import { Button } from "@nfid-frontend/ui"

import { useAuthentication } from "../../../../hooks/useAuthentication"
import { ExampleMethod } from "../../method"
import { TargetCanisterForm } from "./target-canister-from"

export const AuthenticationForm = () => {
  const {
    identity,
    setError,
    nfid,
    setIdentity,
    updateAuthButton,
    authButton,
    handleAuthenticate,
    handleLegacyAuthenticate,
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

  return nfid?.isAuthenticated || identity ? (
    <Button className="h-10" isSmall onClick={handleLogout}>
      Logout
    </Button>
  ) : (
    <div className="flex-col space-y-5">
      <TargetCanisterForm
        submitButtonId="buttonAuthenticate"
        submitButtonText={"Authenticate"}
        isLoading={authButton.loading}
        onSubmit={handleAuthenticate}
      />
      <div className="flex-col mt-5 space-y-2">
        <h3 className="font-semibold">
          Legacy implementation (DFINTIY authClient)
        </h3>
        <div>
          This is only for testing purposes. Please use{" "}
          <ExampleMethod>nfid.getDelegate()</ExampleMethod>
        </div>
        <Button
          isSmall
          id={"buttonLegacyAuth"}
          onClick={handleLegacyAuthenticate}
        >
          <div className={"flex items-center space-x-2"}>
            {authButton.loading ? <ImSpinner className={"animate-spin"} /> : ""}
            <div>Authenticate</div>
          </div>
        </Button>
      </div>
    </div>
  )
}
