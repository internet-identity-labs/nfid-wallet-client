import React from "react"
import { buildDelegate } from "frontend/ii-utils/build-delegate"
import { Centered } from "frontend/ui-utils/atoms/centered"
import { QRCode } from "frontend/ui-utils/atoms/qrcode"
import { usePollforDelegate, useUnknownDeviceConfig } from "./hooks"
import { Button } from "frontend/ui-utils/atoms/button"
import { useMultipass } from "frontend/hooks/use-ii-connection"
import { useInterval } from "frontend/hooks/use-interval"
import { IIConnection } from "frontend/ii-utils/iiConnection"

export const UnknownDeviceScreen: React.FC = () => {
  const [delegation, setDelegation] = React.useState<any | null>(null)
  const [showRegister, setShowRegister] = React.useState(false)
  const { handleAddDevice } = useMultipass()
  const { url, scope, pubKey, appWindow, postClientAuthorizeSuccessMessage } =
    useUnknownDeviceConfig()

  const handleSendDelegate = React.useCallback(() => {
    const parsedSignedDelegation = buildDelegate(delegation)

    postClientAuthorizeSuccessMessage(appWindow, {
      parsedSignedDelegation,
      userKey: delegation.userKey,
      // TODO: handle protocol correctly
      hostname: `http://${scope}`,
    })
  }, [appWindow, delegation, postClientAuthorizeSuccessMessage, scope])

  const handleSuccess = React.useCallback(
    (delegate) => {
      const receivedDelegation = JSON.parse(delegate)
      setDelegation(receivedDelegation)

      // user requested divice registration
      if (receivedDelegation.userNumber) {
        setShowRegister(true)
        return
      }

      handleSendDelegate()
    },
    [handleSendDelegate],
  )

  const handleRegisterDevice = React.useCallback(async () => {
    window.open(
      `/register-new-device/${pubKey}/${delegation.userNumber}`,
      "_blank",
    )
    // const response = await handleAddDevice(BigInt(delegation.userNumber))
  }, [delegation, pubKey])

  const handlePollForDelegate = React.useCallback(
    async (cancelPoll: () => void) => {
      const {
        status_code,
        delegation: [delegate],
      } = await IIConnection.getDelegate(pubKey)
      if (status_code === 200 && delegate) {
        cancelPoll()
        handleSuccess(delegate)
      }
    },
    [handleSuccess, pubKey],
  )

  useInterval(handlePollForDelegate, 2000)

  return (
    <Centered>
      <div className="font-medium mb-3">Sign in to {scope} with Multipass</div>
      {!showRegister && url ? (
        <div className="flex flex-row">
          <div className="mr-2">Scan code to login</div>
          <QRCode content={url} options={{ margin: 0 }} />
        </div>
      ) : null}
      {showRegister && (
        <div className="flex flex-row">
          <Button onClick={handleRegisterDevice}>Register this device?</Button>
        </div>
      )}
    </Centered>
  )
}
