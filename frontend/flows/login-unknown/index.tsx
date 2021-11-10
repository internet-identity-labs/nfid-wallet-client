import React from "react"
import { buildDelegate } from "frontend/ii-utils/build-delegate"
import { Centered } from "frontend/ui-utils/atoms/centered"
import { QRCode } from "frontend/ui-utils/atoms/qrcode"
import { useUnknownDeviceConfig } from "./hooks"
import { Button } from "frontend/ui-utils/atoms/button"
import { useInterval } from "frontend/hooks/use-interval"
import { IIConnection } from "frontend/ii-utils/iiConnection"
import { blobFromUint8Array, derBlobFromBlob } from "@dfinity/candid"
import { setUserNumber } from "frontend/ii-utils/userNumber"

export const UnknownDeviceScreen: React.FC = () => {
  const [message, setMessage] = React.useState<any | null>(null)
  const [showRegister, setShowRegister] = React.useState(false)
  const {
    url,
    scope,
    pubKey,
    appWindow,
    newDeviceKey,
    postClientAuthorizeSuccessMessage,
  } = useUnknownDeviceConfig()

  console.log(">> ", { pubKey })

  const handleSendDelegate = React.useCallback(
    (delegation) => {
      try {
        console.log(">> handleSendDelegate", { delegation })

        const parsedSignedDelegation = buildDelegate(delegation)

        postClientAuthorizeSuccessMessage(appWindow, {
          parsedSignedDelegation,
          userKey: delegation.userKey,
          // TODO: handle protocol correctly
          hostname: `http://${scope}`,
        })
      } catch (err) {
        console.error(">> not a valid delegate", { err })
      }
    },
    [appWindow, postClientAuthorizeSuccessMessage, scope],
  )

  const handleSuccess = React.useCallback(
    (receivedMessage) => {
      setMessage(receivedMessage)

      // user requested divice registration
      if (receivedMessage.userNumber) {
        setShowRegister(true)
        return
      }

      handleSendDelegate(receivedMessage)
    },
    [handleSendDelegate],
  )

  const handleRegisterDevice = React.useCallback(async () => {
    window.open(
      `/register-new-device/${pubKey}/${message.userNumber}`,
      "_blank",
    )
    // const response = await handleAddDevice(BigInt(delegation.userNumber))
  }, [message, pubKey])

  const handlePollForDelegate = React.useCallback(
    async (cancelPoll: () => void) => {
      const messages = await IIConnection.getMessages(pubKey)
      if (messages.length > 0) {
        console.log(">> ", { messages })
        const parsedMessages = messages.map((m) => JSON.parse(m))
        const loginMessage = parsedMessages.find(
          (m) => m.type === "remote-login",
        )
        const registerMessage = parsedMessages.find(
          (m) => m.type === "remote-login-register",
        )
        if (loginMessage || registerMessage) {
          handleSuccess(loginMessage || registerMessage)
          cancelPoll()
        }
      }
    },
    [handleSuccess, pubKey],
  )

  const handleWaitForRegisteredDeviceKey = React.useCallback(async () => {
    const existingDevices = await IIConnection.lookupAll(
      BigInt(message.userNumber),
    )

    const matchedDevice = existingDevices.find(
      (deviceData) => deviceData.pubkey.toString() === newDeviceKey.toString(),
    )

    console.log(">> ", { existingDevices, newDeviceKey, matchedDevice })

    if (matchedDevice) {
      setUserNumber(BigInt(message.userNumber))
      handleSendDelegate(message)
    }
  }, [handleSendDelegate, message, newDeviceKey])

  useInterval(handlePollForDelegate, 2000)
  useInterval(handleWaitForRegisteredDeviceKey, 2000, !!newDeviceKey)

  return (
    <Centered>
      <div className="font-medium mb-3">Sign in to {scope} with Multipass</div>
      {!showRegister && url ? (
        <a href={url} target="_blank">
          <div className="flex flex-row">
            <div className="mr-2">Scan code to login</div>
            <QRCode content={url} options={{ margin: 0 }} />
          </div>
        </a>
      ) : null}
      {showRegister && (
        <div className="flex flex-row">
          <Button onClick={handleRegisterDevice}>Register this device?</Button>
        </div>
      )}
    </Centered>
  )
}
