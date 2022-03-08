import { blobFromHex, derBlobFromBlob } from "@dfinity/candid"
import clsx from "clsx"
import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { IFrameRestoreAccessPointConstants as RAC } from "frontend/flows/screens-iframe/restore-access-point/routes"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useInterval } from "frontend/hooks/use-interval"
import { useMultipass } from "frontend/hooks/use-multipass"
import { AuthorizeAppUnknownDevice } from "frontend/screens/authorize-app-unknown-device"
import { AuthorizeRegisterDecider } from "frontend/screens/authorize-register-decider"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"
import {
  derFromPubkey,
  IIConnection,
} from "frontend/services/internet-identity/iiConnection"
import { Loader } from "frontend/ui-kit/src/index"
import React from "react"
import { useNavigate } from "react-router-dom"
import { useMessageChannel } from "./hooks/use-message-channel"
import { useUnknownDeviceConfig } from "./hooks/use-unknown-device.config"

interface UnknownDeviceScreenProps {}

export const UnknownDeviceScreen: React.FC<UnknownDeviceScreenProps> = ({}) => {
  const { applicationName } = useMultipass()
  const { identityManager, isAuthenticated } = useAuthentication()
  const { createDevice, error } = useDevices()
  const { getPersona } = usePersona()
  const { readAccount } = useAccount()
  const navigate = useNavigate()

  const {
    status,
    url,
    showRegister,
    userNumber,
    handleRegisterDevice,
    handleSendDelegate,
    handlePollForDelegate,
  } = useUnknownDeviceConfig()
  const isLoading = status === "loading"

  console.log(">> UnknownDeviceScreen", {
    isAuthenticated,
    isLoading,
    status,
    showRegister,
  })

  useInterval(handlePollForDelegate, 2000)

  const handleNewDevice = React.useCallback(
    async (event) => {
      if (!userNumber) throw new Error("No userNumber found")

      const { publicKey: pubkey } = event.data.device

      await createDevice({
        ...event.data.device,
        userNumber,
      })

      const allDevices = await IIConnection.lookupAll(BigInt(userNumber))
      const publicKey = derBlobFromBlob(blobFromHex(pubkey))

      const matchDevice = allDevices.find(
        (item) => derFromPubkey(item.pubkey) === publicKey,
      )
      if (!matchDevice) throw new Error("Device creation failed")

      const [account, persona] = await Promise.all([
        readAccount(),
        getPersona(),
      ])

      handleSendDelegate()
    },
    [createDevice, getPersona, handleSendDelegate, readAccount, userNumber],
  )

  useMessageChannel({
    messageHandler: {
      "new-device": handleNewDevice,
    },
  })

  return (
    <div className={clsx("relative")}>
      {/* IFrameAuthorizeAppUnkownDevice */}
      {!isLoading && !showRegister && url ? (
        <IFrameScreen logo>
          <AuthorizeAppUnknownDevice
            applicationName={applicationName}
            url={url}
            onLogin={() =>
              navigate(`${RAC.base}/${RAC.recoveryPhrase}`, {
                state: { from: "loginWithRecovery" },
              })
            }
          />
        </IFrameScreen>
      ) : null}
      {/* IFrameAuthorizeAppUnkownDevice(AwaitConfirmationState)  */}
      {isLoading && (
        <div className="relative w-full h-full">
          <div className="flex flex-col h-full w-full items-center justify-center px-14 backdrop-blur bg-[#ffffffd9]">
            <Loader
              iframe
              isLoading={isLoading}
              fullscreen={false}
              imageClasses={"w-[90px] mx-auto py-6 -mt-4"}
            />
            <div className="mt-5 text-center">
              Awaiting confirmation from your phone...
            </div>
          </div>
        </div>
      )}
      {showRegister && !isLoading && (
        <IFrameScreen logo>
          <AuthorizeRegisterDecider
            onRegister={handleRegisterDevice}
            onLogin={handleSendDelegate}
          />
        </IFrameScreen>
      )}
    </div>
  )
}
