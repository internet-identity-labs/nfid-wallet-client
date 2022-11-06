import { HttpAgent } from "@dfinity/agent"
import { AuthClient } from "@dfinity/auth-client"
import { DelegationIdentity } from "@dfinity/identity"
import { Button, H1 } from "@nfid-frontend/ui"
import clsx from "clsx"
import { useCallback, useState } from "react"
import { ImSpinner } from "react-icons/im"

import { environment } from "../../environments/environment"
import { useButtonState } from "../../hooks/useButtonState"
import { PageTemplate } from "../page-template"

let identity: DelegationIdentity

export const PageGetAccounts = () => {
  const [authButton, updateAuthButton] = useButtonState({
    label: "Authenticate",
  })
  const [requestButton, updateRequestButton] = useButtonState({
    label: "Request accounts",
    disabled: true,
  })

  const [principal, setPrincipal] = useState("")

  const handleAuthenticate = useCallback(async () => {
    const authClient = await AuthClient.create()
    updateAuthButton({ loading: true, label: "Authenticating..." })

    await authClient.login({
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
        updateRequestButton({ disabled: false })
        setPrincipal(identity.getPrincipal().toText())
      },
      onError: (error) => {
        console.error(error)
      },
      identityProvider: `${environment.nfidProviderOrigin}/authenticate`,
      windowOpenerFeatures: `toolbar=0,location=0,menubar=0,width=525,height=705`,
    })
  }, [updateAuthButton, updateRequestButton])

  const handleRequestAccounts = useCallback(async () => {
    // updateRequestButton({ loading: true })
    // const result = await requestAccounts()
    // console.log({ result })
  }, [])

  return (
    <PageTemplate title="Get accounts">
      <H1 className="title">Request accounts</H1>

      <div className="flex flex-col w-64">
        <p className="font-bold">Step 1 - Authenticate</p>
        <Button
          primary
          disabled={authButton.disabled}
          onClick={handleAuthenticate}
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

        <p className="mt-8 font-bold">Step 2 - Request Accounts</p>
        <Button
          primary
          disabled={requestButton.disabled}
          onClick={handleRequestAccounts}
        >
          {requestButton.loading ? (
            <div className={clsx("flex items-center space-x-2")}>
              <ImSpinner className={clsx("animate-spin")} />
              <div>{requestButton.label}</div>
            </div>
          ) : (
            requestButton.label
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
        <h2 className={clsx("font-bold")}>Identity principal:</h2>
        <pre>{JSON.stringify(principal, null, 2)}</pre>
      </div>
    </PageTemplate>
  )
}
