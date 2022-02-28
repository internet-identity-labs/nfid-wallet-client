import { blobFromHex } from "@dfinity/candid"
import clsx from "clsx"
import { CONFIG } from "frontend/config"
import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { RegisterNewDeviceConstants as RNDC } from "frontend/flows/screens-app/register-device/routes"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useInterval } from "frontend/hooks/use-interval"
import { useMultipass } from "frontend/hooks/use-multipass"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { apiResultToLoginResult } from "frontend/services/internet-identity/api-result-to-login-result"
import { buildDelegate } from "frontend/services/internet-identity/build-delegate"
import { IIConnection } from "frontend/services/internet-identity/iiConnection"
import { usePubSubChannel } from "frontend/services/pub-sub-channel/use-pub-sub-channel"
import { Button, H5, Loader, QRCode } from "frontend/ui-kit/src/index"
import React from "react"
import { useNavigate } from "react-router-dom"
import { AuthorizeRegisterDecider } from "./authorize-register-decider"
import { useUnknownDeviceConfig } from "./hooks"

interface UnknownDeviceScreenProps {
  showRegisterDefault?: boolean
}

export const UnknownDeviceScreen: React.FC<UnknownDeviceScreenProps> = ({
  showRegisterDefault,
}) => {
  const { applicationName } = useMultipass()
  const { readAccount } = useAccount()
  // TODO: improve method naming
  const { identityManager, onRegisterSuccess: setAuthenticatedActors } =
    useAuthentication()
  const [showRegister, setShowRegister] = React.useState(showRegisterDefault)
  const {
    status,
    setStatus,
    message,
    setMessage,
    url,
    scope,
    pubKey,
    appWindow,
    newDeviceKey,
    setNewDeviceKey,
    postClientAuthorizeSuccessMessage,
  } = useUnknownDeviceConfig()
  const isLoading = status === "loading"
  const navigate = useNavigate()

  const { getMessages } = usePubSubChannel()
  const handleLoginFromRemoteDelegation = React.useCallback(
    async (registerMessage) => {
      const loginResult = await IIConnection.loginFromRemoteFrontendDelegation({
        chain: JSON.stringify(registerMessage.nfid.chain),
        sessionKey: JSON.stringify(registerMessage.nfid.sessionKey),
        userNumber: BigInt(registerMessage.userNumber),
      })
      const result = apiResultToLoginResult(loginResult)

      if (result.tag === "ok") {
        setAuthenticatedActors(result)
      }
      // TODO: handle this more gracefully
      if (result.tag !== "ok") throw new Error("login failed")
    },
    [setAuthenticatedActors],
  )

  const handleSendDelegate = React.useCallback(
    (delegation) => {
      try {
        const parsedSignedDelegation = buildDelegate(delegation)
        const protocol =
          CONFIG.FRONTEND_MODE === "development"
            ? "http:"
            : window.location.protocol
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

  const handleRegisterDevice = React.useCallback(async () => {
    setStatus("loading")
    window.open(`${RNDC.base}/${pubKey}/${message.userNumber}`, "_blank")
    // const response = await handleAddDevice(BigInt(delegation.userNumber))
  }, [message?.userNumber, pubKey, setStatus])

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
        const registerMessage = parsedMessages.find(
          (m) => m.type === "remote-login-register",
        )

        if (registerMessage) {
          handleLoginFromRemoteDelegation(registerMessage)
          setMessage(registerMessage)

          setStatus("success")
          setShowRegister(true)
          cancelPoll()
        }
        if (waitingMessage) {
          setStatus("loading")
        }
      }
    },
    [
      getMessages,
      handleLoginFromRemoteDelegation,
      pubKey,
      setMessage,
      setStatus,
    ],
  )

  const handleWaitForRegisteredDeviceKey = React.useCallback(async () => {
    const existingDevices = await IIConnection.lookupAll(
      BigInt(message.userNumber),
    )

    // TODO: fix the comparison
    const matchedDevice = existingDevices.find((deviceData) => {
      const existingDeviceString = deviceData.pubkey.toString()
      const newDeviceKeyString = blobFromHex(newDeviceKey).toString()

      existingDeviceString === newDeviceKeyString
    })

    await readAccount(identityManager)
    setStatus("success")
    handleSendDelegate(message)
    setNewDeviceKey(null)
  }, [
    handleSendDelegate,
    identityManager,
    message,
    newDeviceKey,
    readAccount,
    setNewDeviceKey,
    setStatus,
  ])

  useInterval(handlePollForDelegate, 2000)
  useInterval(handleWaitForRegisteredDeviceKey, 2000, !!newDeviceKey)

  return (
    <div className={clsx("relative", isLoading && "bg-white")}>
      {/* IFrameAuthorizeAppUnkownDevice */}
      {!isLoading && !showRegister && url ? (
        <IFrameScreen logo>
          <H5 className="mb-4">Log in to {applicationName} with your NFID</H5>
          <div className="flex flex-col">
            <div>
              This application uses NFID, the most secure, private, and
              convenient Internet Identity.
            </div>

            <div className="pt-5 pb-3 m-auto">
              <a href={url} target="_blank">
                <QRCode content={url} options={{ margin: 0 }} />
              </a>
            </div>

            <div className="text-gray-500 text-xs text-center mb-1">
              Scan this code with your phone's camera
            </div>

            <Button text className="mb-2">
              Log in with Recovery Phrase
            </Button>
          </div>
        </IFrameScreen>
      ) : null}

      {/* IFrameAuthorizeAppUnkownDevice(AwaitConfirmationState) */}
      {isLoading && (
        <div className="absolute overflow-hidden h-full w-full inset-0">
          <div className="flex flex-col h-full w-full items-center justify-center px-14 backdrop-blur bg-[#ffffffd9]">
            <Loader
              iframe
              isLoading={isLoading}
              fullscreen={false}
              imageClasses={"w-[90px] mx-auto py-6 -mt-4"}
            />
            <div className="text-center mt-5">
              Awaiting confirmation from your phone...
            </div>
          </div>
        </div>
      )}

      {showRegister && !isLoading && (
        <AuthorizeRegisterDecider
          onRegister={handleRegisterDevice}
          onLogin={() => handleSendDelegate(message)}
        />
      )}
    </div>
  )
}
