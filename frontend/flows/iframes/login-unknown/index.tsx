import {
  Button,
  H5,
  Loader,
  QRCode,
  SetupTouchId,
} from "frontend/ui-kit/src/index"
import clsx from "clsx"
import { CONFIG } from "frontend/config"
import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { RegisterNewDeviceConstants as RNDC } from "frontend/flows/register-device/routes"
import { useInterval } from "frontend/hooks/use-interval"
import { useMultipass } from "frontend/hooks/use-multipass"
import { buildDelegate } from "frontend/services/internet-identity/build-delegate"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"
import { setUserNumber } from "frontend/services/internet-identity/userNumber"
import React from "react"
import { useUnknownDeviceConfig } from "./hooks"

interface UnknownDeviceScreenProps {
  showRegisterDefault?: boolean
}

export const UnknownDeviceScreen: React.FC<UnknownDeviceScreenProps> = ({
  showRegisterDefault = false,
}) => {
  const { applicationName } = useMultipass()
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

  // TODO: for cleanup we need NFID delegate

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
        setStatus("success")
        setShowRegister(true)
        return
      }

      handleSendDelegate(receivedMessage)
    },
    [handleSendDelegate],
  )

  const handleRegisterDevice = React.useCallback(async () => {
    setStatus("loading")
    window.open(`${RNDC.base}/${pubKey}/${message.userNumber}`, "_blank")
    // const response = await handleAddDevice(BigInt(delegation.userNumber))
  }, [message, pubKey])

  const handlePollForDelegate = React.useCallback(
    async (cancelPoll: () => void) => {
      const {
        body: [messages],
      } = await getMessages(pubKey)

      if (messages && messages.length > 0) {
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

  const isLoading = status === "loading"

  return (
    // TODO: title
    <IFrameScreen>
      <H5 className="text-center py-4">
        {isLoading
          ? "Awaiting confirmation from your phone"
          : `Log in to ${applicationName} with your NFID`}
      </H5>
      {!isLoading && !showRegister && url ? (
        <a href={url} target="_blank">
          <div className="flex flex-col justify-center text-center">
            <div>Scan this code with the camera app on your phone</div>
            <div className="m-auto py-2">
              <QRCode content={url} options={{ margin: 0 }} />
            </div>
            <Button text className="mb-2">I already have an NFID</Button>
          </div>
        </a>
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
      <Loader isLoading={isLoading} />
    </IFrameScreen>
  )
}
