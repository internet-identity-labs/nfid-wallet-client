import clsx from "clsx"
import { useCallback, useState } from "react"
import { ImSpinner } from "react-icons/im"

import { Button, H1 } from "@nfid-frontend/ui"
import { NFID } from "@nfid/embed"

import { useButtonState } from "../../hooks/useButtonState"
import { PageTemplate } from "../page-template"

declare const NFID_PROVIDER_URL: string

const nfid = NFID.init({ origin: NFID_PROVIDER_URL })

export const PageAuthenticationGetDelegation = () => {
  const [authButton, updateAuthButton] = useButtonState({
    label: "Authenticate",
  })

  const [nfidResponse, setNfidResponse] = useState({})

  const handleAuthenticate = useCallback(async () => {
    console.debug("handleAuthenticate")
    updateAuthButton({ loading: true, label: "Authenticating..." })
    nfid.connect()
  }, [updateAuthButton])

  const handleLogout = useCallback(async () => {
    setNfidResponse({})
    updateAuthButton({
      disabled: false,
      loading: false,
      label: "Authenticate",
    })
  }, [updateAuthButton])

  return (
    <PageTemplate title="Authentication / Registration">
      <H1 className="title">Authentication / Registration</H1>
      <div>
        by using <pre>@nfid/embed</pre>
      </div>

      {!nfid.isAuthenticated && (
        <div className="flex flex-col w-64 my-8">
          <Button
            disabled={authButton.disabled}
            onClick={
              authButton.label === "Logout" ? handleLogout : handleAuthenticate
            }
          >
            {authButton.loading ? (
              <div className={clsx("flex items-center space-x-2")}>
                <ImSpinner className={clsx("animate-spin")} />
                <div>{authButton.label}</div>
              </div>
            ) : (
              authButton.label
            )}
          </Button>
        </div>
      )}

      <div
        className={clsx(
          "w-full border border-gray-200 rounded-xl",
          "px-5 py-4 mt-8",
          "sm:px-[30px] sm:py-[26px]",
        )}
      >
        <h2 className={clsx("font-bold mb-1")}>NFID Response:</h2>
        <pre>{JSON.stringify(nfidResponse, null, 2)}</pre>
      </div>
    </PageTemplate>
  )
}
