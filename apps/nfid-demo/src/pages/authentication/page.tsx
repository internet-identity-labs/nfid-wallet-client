import { HttpAgent } from "@dfinity/agent"
import { AuthClient } from "@dfinity/auth-client"
import { DelegationIdentity } from "@dfinity/identity"
import clsx from "clsx"
import { useCallback, useState } from "react"
import { ImSpinner } from "react-icons/im"

import { Button, H1 } from "@nfid-frontend/ui"

import { useButtonState } from "../../hooks/useButtonState"
import { PageTemplate } from "../page-template"

let identity: DelegationIdentity

export const PageAuthentication = () => {
  const [authButton, updateAuthButton] = useButtonState({
    label: "Authenticate",
  })

  const [nfidResponse, setNfidResponse] = useState({})

  const handleAuthenticate = useCallback(async () => {
    const authClient = await AuthClient.create()
    updateAuthButton({ loading: true, label: "Authenticating..." })
    await authClient.login({
      idpWindowName: "nfidIdpWindow",
      onSuccess: () => {
        identity = authClient.getIdentity() as DelegationIdentity
        if (!(window as any).ic) (window as any).ic = {}
        ;(window as any).ic.agent = new HttpAgent({
          identity,
          host: "https://ic0.app",
        })
        updateAuthButton({
          disabled: true,
          loading: false,
          label: "Authenticated",
        })
        setNfidResponse({ principal: identity.getPrincipal().toText() })
      },
      onError: (error) => {
        console.error(error)
      },
      identityProvider: `${NFID_PROVIDER_URL}/authenticate`,
      windowOpenerFeatures: `toolbar=0,location=0,menubar=0,width=525,height=705`,
    })
  }, [updateAuthButton])

  return (
    <PageTemplate title="Get accounts">
      <H1 className="title">Authentication / Registration</H1>

      <div className="flex flex-col w-64 my-8">
        <Button disabled={authButton.disabled} onClick={handleAuthenticate}>
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
