import clsx from "clsx"
import { useCallback, useState } from "react"
import { ImSpinner } from "react-icons/im"
import useSWR from "swr"

import { Button, H1 } from "@nfid-frontend/ui"
import { NFID } from "@nfid/embed"

import { useButtonState } from "../../hooks/useButtonState"
import { PageTemplate } from "../page-template"
import React from "react"

declare const NFID_PROVIDER_URL: string


export const PageAuthenticationGetDelegation = () => {
  const [authButton, updateAuthButton] = useButtonState({
    label: "Authenticate",
  })
  const { data: nfid } = useSWR("nfid", () => NFID.init({ origin: NFID_PROVIDER_URL }))

  React.useEffect(() => {
    if (nfid?.isAuthenticated) {
      const identity = nfid.getIdentity()
      updateAuthButton({ label: "Logout" })
      setNfidResponse({ principal: identity.getPrincipal().toText() })
    }
  }, [nfid, updateAuthButton])

  const [nfidResponse, setNfidResponse] = useState({})

  const handleAuthenticate = useCallback(async () => {
    if (!nfid) throw new Error("NFID not initialized")

    console.debug("handleAuthenticate")
    updateAuthButton({ loading: true, label: "Authenticating..." })
    const identity = await nfid.getDelegation()
    updateAuthButton({ loading: false, label: "Authenticated" })
    setNfidResponse({ principal: identity.getPrincipal().toText() })
  }, [nfid, updateAuthButton])

  const handleRenewDelegation = useCallback(async () => {
    if (!nfid) throw new Error("NFID not initialized")

    console.debug("handleAuthenticate")
    updateAuthButton({ loading: true, label: "Authenticating..." })
    const identity = await nfid.renewDelegation()
    updateAuthButton({ loading: false, label: "Authenticated" })
    setNfidResponse({ principal: identity.getPrincipal().toText() })
  }, [nfid, updateAuthButton])

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

      {!nfid?.isAuthenticated && (
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

      {nfid?.isAuthenticated && (
        <div className="flex flex-col w-64 my-8">
          <Button
            disabled={authButton.disabled}
            onClick={handleRenewDelegation}
          >
            Renew Delegation
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
