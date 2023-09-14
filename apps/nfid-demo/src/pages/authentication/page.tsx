import { HttpAgent } from "@dfinity/agent"
import clsx from "clsx"
import { useCallback, useState } from "react"
import { ImSpinner } from "react-icons/im"
import useSWR from "swr"

import { Button, H1 } from "@nfid-frontend/ui"

import { useButtonState } from "../../hooks/useButtonState"
import { PageTemplate } from "../page-template"
import { AuthClient } from "@dfinity/auth-client"

declare const NFID_PROVIDER_URL: string

let identity: ReturnType<AuthClient["getIdentity"]>

export const PageAuthentication = () => {
  const [authButton, updateAuthButton] = useButtonState({
    label: "Authenticate",
  })

  const [nfidResponse, setNfidResponse] = useState({})
  const { data: authClient } = useSWR("authClient", () =>
    AuthClient.create(),
  )

  const handleAuthenticate = useCallback(async () => {
    if (!authClient) return

    updateAuthButton({ loading: true, label: "Authenticating..." })
    await authClient.login({
      onSuccess: () => {
        identity = authClient.getIdentity()
        if (!(window as any).ic) (window as any).ic = {}
        ;(window as any).ic.agent = new HttpAgent({
          //@ts-ignore
          identity,
          host: "https://ic0.app",
        })
        updateAuthButton({
          disabled: false,
          loading: false,
          label: "Logout",
        })
        setNfidResponse({ principal: identity.getPrincipal().toText() })
      },
      onError: (error) => {
        console.error(error)
      },
      identityProvider: `${NFID_PROVIDER_URL}/authenticate?applicationName=NFID-DEMO&applicationLogo=https://logo.clearbit.com/clearbit.com`,
      windowOpenerFeatures: `toolbar=0,location=0,menubar=0,width=525,height=705`,
    })
  }, [authClient, updateAuthButton])

  const handleLogout = useCallback(async () => {
    authClient?.logout()
    setNfidResponse({})
    updateAuthButton({
      disabled: false,
      loading: false,
      label: "Authenticate",
    })
  }, [authClient, updateAuthButton])

  return (
    <PageTemplate title="Authentication / Registration">
      <H1 className="title">Authentication / Registration</H1>

      {authClient && (
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
