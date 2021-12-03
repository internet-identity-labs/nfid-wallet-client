import React from "react"
import { buildDelegate } from "frontend/ii-utils/build-delegate"
import { Centered } from "frontend/ui-utils/atoms/centered"
import { QRCode } from "frontend/ui-utils/atoms/qrcode"
import { useUnknownDeviceConfig } from "./hooks"
import { useInterval } from "frontend/hooks/use-interval"
import { IIConnection } from "frontend/ii-utils/iiConnection"
import { setUserNumber } from "frontend/ii-utils/userNumber"
import clsx from "clsx"
import { Loader } from "frontend/ui-utils/atoms/loader"
import { SetupTouchId } from "frontend/ui-utils/molecules/setup-touch-id"
import { useMultipass } from "frontend/hooks/use-multipass"
import { CONFIG } from "frontend/config"
import { IFrameScreen } from "frontend/ui-utils/templates/IFrameScreen"

interface UnknownDeviceScreenProps {
  showRegisterDefault?: boolean
}

export const UnknownDeviceScreen: React.FC<UnknownDeviceScreenProps> = ({
  showRegisterDefault = false,
}) => {
  const [status, setStatus] = React.useState<"initial" | "loading" | "success">(
    "initial",
  )
  const [message, setMessage] = React.useState<any | null>(null)
  const [showRegister, setShowRegister] = React.useState(showRegisterDefault)
  const {
    url,
    scope,
    pubKey,
    appWindow,
    newDeviceKey,
    postClientAuthorizeSuccessMessage,
  } = useUnknownDeviceConfig()
  const { getMessages } = useMultipass()

  const handleSendDelegate = React.useCallback(
    (delegation) => {
      try {
        const parsedSignedDelegation = buildDelegate(delegation)
        const protocol =
          CONFIG.II_ENV === "development" ? "http:" : window.location.protocol
        const hostname = `${protocol}//${scope}`

        postClientAuthorizeSuccessMessage(appWindow, {
          parsedSignedDelegation,
          userKey: delegation.userKey,
          hostname,
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

      // user requested device registration
      if (receivedMessage.userNumber) {
        setShowRegister(true)
        return
      }

      handleSendDelegate(receivedMessage)
    },
    [handleSendDelegate],
  )

  const handleRegisterDevice = React.useCallback(async () => {
    setStatus("loading")
    window.open(
      `/register-new-device/${pubKey}/${message.userNumber}`,
      "_blank",
    )
    // const response = await handleAddDevice(BigInt(delegation.userNumber))
  }, [message, pubKey])

  const handlePollForDelegate = React.useCallback(
    async (cancelPoll: () => void) => {
      const messages = await getMessages(pubKey)

      if (messages.length > 0) {
        const parsedMessages = messages.map((m) => JSON.parse(m))
        const waitingMessage = parsedMessages.find(
          (m) => m.type === "remote-login-wait-for-user",
        )
        const loginMessage = parsedMessages.find(
          (m) => m.type === "remote-login",
        )
        const registerMessage = parsedMessages.find(
          (m) => m.type === "remote-login-register",
        )

        console.log(">> handlePollForDelegate", {
          loginMessage,
          registerMessage,
        })

        if (loginMessage || registerMessage) {
          setStatus("success")
          handleSuccess(loginMessage || registerMessage)
          cancelPoll()
        }
        if (waitingMessage) {
          setStatus("loading")
        }
      }
    },
    [getMessages, handleSuccess, pubKey],
  )

  const handleWaitForRegisteredDeviceKey = React.useCallback(async () => {
    const existingDevices = await IIConnection.lookupAll(
      BigInt(message.userNumber),
    )

    const matchedDevice = existingDevices.find(
      (deviceData) => deviceData.pubkey.toString() === newDeviceKey.toString(),
    )

    if (matchedDevice) {
      setStatus("success")
      setUserNumber(BigInt(message.userNumber))
      handleSendDelegate(message)
    }
  }, [handleSendDelegate, message, newDeviceKey])

  useInterval(handlePollForDelegate, 2000)
  useInterval(handleWaitForRegisteredDeviceKey, 2000, !!newDeviceKey)

  return (
    <IFrameScreen>
      <Centered>
        {!showRegister && url ? (
          <>
            <div className="font-medium mb-3">Scan to sign in</div>
            <a href={url} target="_blank">
              <div className="flex flex-row">
                <QRCode content={url} options={{ margin: 0 }} />
              </div>
            </a>
          </>
        ) : null}
        {showRegister && (
          <div className="flex flex-col">
            <SetupTouchId onClick={handleRegisterDevice} />
            <a
              onClick={() => handleSendDelegate(message)}
              className={clsx("text-blue-900 text-center mt-4 cursor-pointer")}
            >
              just log me in!
            </a>
          </div>
        )}
        <Loader isLoading={status === "loading"} />
      </Centered>
    </IFrameScreen>
  )
}
