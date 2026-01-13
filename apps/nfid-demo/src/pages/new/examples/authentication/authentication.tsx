import React from "react"
import { ImSpinner } from "react-icons/im"

import { Button, DropdownSelect } from "@nfid/ui"

import { useAuthentication } from "../../../../hooks/useAuthentication"
import { ExampleMethod } from "../../method"
import { AuthenticationForm } from "./form"

type BaseKeyType = "ECDSA" | "Ed25519"

export const AuthenticationExample = ({
  onError,
}: {
  onError: (error: { error: string }) => void
}) => {
  const {
    identity,
    error,
    setError,
    nfid,
    setIdentity,
    setDerivationOrigin,
    keyType,
    setKeyType,
    updateAuthButton,
    authButton,
    handleAuthenticate,
    handleLegacyAuthenticate,
  } = useAuthentication()

  React.useEffect(() => {
    error && onError({ error })
  }, [error, onError])

  const handleLogout = React.useCallback(async () => {
    setError(undefined)
    if (!nfid) throw new Error("NFID not initialized")

    await nfid.logout()
    setIdentity(undefined)
    setDerivationOrigin(undefined)
    updateAuthButton({
      disabled: false,
      loading: false,
      label: "Authenticate",
    })
  }, [nfid, setError, setIdentity, updateAuthButton, setDerivationOrigin])

  return nfid?.isAuthenticated || identity ? (
    <Button className="h-10" isSmall onClick={handleLogout}>
      Logout
    </Button>
  ) : (
    <div className="flex-col space-y-5">
      <DropdownSelect
        selectedValues={[keyType]}
        isMultiselect={false}
        setSelectedValues={(value) => setKeyType(value[0] as BaseKeyType)}
        options={[
          { label: "ECDSA", value: "ECDSA" },
          { label: "Ed25519", value: "Ed25519" },
        ]}
      />
      <AuthenticationForm
        submitButtonId="buttonAuthenticate"
        submitButtonText={"Authenticate"}
        isLoading={authButton.loading}
        submitButtonDisabled={authButton.disabled}
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
          disabled={authButton.disabled}
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
