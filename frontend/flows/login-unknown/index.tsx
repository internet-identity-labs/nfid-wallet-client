import React from "react"
import { buildDelegate } from "frontend/ii-utils/build-delegate"
import { Centered } from "frontend/ui-utils/atoms/centered"
import { QRCode } from "frontend/ui-utils/atoms/qrcode"
import { usePollforDelegate, useUnknownDeviceConfig } from "./hooks"

export const UnknownDeviceScreen: React.FC = () => {
  const { url, scope, pubKey, appWindow, postClientAuthorizeSuccessMessage } =
    useUnknownDeviceConfig()

  const handleSuccess = React.useCallback(
    (delegate) => {
      const receivedDelegation = JSON.parse(delegate)
      const parsedSignedDelegation = buildDelegate(receivedDelegation)

      postClientAuthorizeSuccessMessage(appWindow, {
        parsedSignedDelegation,
        userKey: receivedDelegation.userKey,
        // TODO: handle protocol correctly
        hostname: `http://${scope}`,
      })
    },
    [appWindow, postClientAuthorizeSuccessMessage, scope],
  )

  usePollforDelegate({
    pubKey,
    onSuccess: handleSuccess,
  })

  return (
    <Centered>
      <div className="font-medium mb-3">Sign in to {scope} with Multipass</div>
      {url ? (
        <div className="flex flex-row">
          <div className="mr-2">Scan code to login</div>
          <QRCode content={url} options={{ margin: 0 }} />
        </div>
      ) : null}
    </Centered>
  )
}
