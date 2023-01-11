import { Identity } from "@dfinity/agent"
import { AuthClient } from "@dfinity/auth-client"
import clsx from "clsx"
import React from "react"
import useSWR from "swr"

import { Button } from "@nfid-frontend/ui"

import { PageTemplate } from "../page-template"
import { AuthIFrame } from "./auth-iframe"

export const PageAuthenticationIframe = () => {
  const [mountIFrame, setMountIframe] = React.useState(false)
  React.useEffect(() => {
    if (!mountIFrame) setMountIframe(true)
  }, [mountIFrame])

  const [identity, setIdentity] = React.useState<Identity | null>(null)
  const { data: authClient } = useSWR("authClient", () => AuthClient.create())

  const handleAuthenticate = React.useCallback(async () => {
    const authClient = await AuthClient.create()
    console.debug("handleAuthenticate", { authClient })
    await authClient.login({
      onSuccess: () => {
        console.debug("handleAuthenticate", {
          identity: authClient.getIdentity().getPrincipal().toText(),
        })
        setIdentity(authClient.getIdentity())
      },
      onError: (error) => {
        console.error(error)
      },
      identityProvider: `${NFID_PROVIDER_URL}/authenticate`,
    })
  }, [])

  const handleLogout = React.useCallback(async () => {
    authClient?.logout()
    setIdentity(null)
  }, [authClient])

  return (
    <PageTemplate title="Authentication iFrame">
      {!identity && mountIFrame && (
        <AuthIFrame
          identityProvider={`${NFID_PROVIDER_URL}/authenticate`}
          authenticate={handleAuthenticate}
        />
      )}
      {identity && (
        <div className="flex flex-col w-64 my-8">
          <Button onClick={handleLogout}>Logout</Button>
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
        <pre>
          {JSON.stringify(
            { principalId: identity?.getPrincipal().toString() },
            null,
            2,
          )}
        </pre>
      </div>
    </PageTemplate>
  )
}
