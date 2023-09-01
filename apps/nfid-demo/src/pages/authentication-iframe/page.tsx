import { Identity } from "@dfinity/agent"
import { AuthClient } from "@dfinity/auth-client"
import clsx from "clsx"
import React, { useCallback, useState } from "react"

import { PageTemplate } from "../page-template"
import { AuthIFrame } from "./auth-iframe"
import { IframeConfig } from "./components/iframe-config"

export const PageAuthenticationIframe = () => {
  const [iframeStyleQueries, setIframeStyleQueries] = useState("")
  const [mountIFrame, setMountIframe] = React.useState(false)
  React.useEffect(() => {
    if (!mountIFrame) setMountIframe(true)
  }, [mountIFrame])

  const [identity, setIdentity] = React.useState<Identity | null>(null)

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
      identityProvider: `${NFID_PROVIDER_URL}/authenticate?applicationName=NFID-DEMO&applicationLogo=https://logo.clearbit.com/clearbit.com`,
      idpWindowName: "nfidIdpWindow",
    })
  }, [])

  const onUpdateIframeStyles = useCallback((value: string) => {
    setIframeStyleQueries(value)
    setMountIframe(false)
    setMountIframe(true)
  }, [])

  return (
    <PageTemplate title="Authentication iFrame" className="!p-0">
      <div className="grid h-full grid-cols-[auto,440px] w-full">
        <div className="border-r border-gray-100 p-2.5">
          <IframeConfig
            updateStyleQuery={onUpdateIframeStyles}
            renderIframe={() => {
              setMountIframe(false)
              setMountIframe(true)
            }}
          />
        </div>
        <div className="flex flex-col items-center py-2.5">
          {mountIFrame ? (
            <AuthIFrame
              identityProvider={`${NFID_PROVIDER_URL}/authenticate?${iframeStyleQueries}`}
              authenticate={handleAuthenticate}
            />
          ) : null}
          <div className="bg-gray-100 h-[1px] w-full my-2.5" />
          <h2 className={clsx("font-bold mb-1 w-full pl-2.5")}>
            NFID Response:
          </h2>
          <div id="principalID" className="w-full font-mono text-left px-2.5">
            {JSON.stringify(
              { principalId: identity?.getPrincipal().toString() },
              null,
              2,
            )}
          </div>
        </div>
      </div>
    </PageTemplate>
  )
}
