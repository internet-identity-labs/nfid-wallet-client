import { blobFromHex } from "@dfinity/candid"
import clsx from "clsx"
import React from "react"
import { useNavigate } from "react-router-dom"

import { AppScreen } from "frontend/design-system/templates/AppScreen"
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
import { IIConnection } from "frontend/services/internet-identity/iiConnection"
import { Loader } from "frontend/ui-kit/src/index"

import { useMessageChannel } from "./hooks/use-message-channel"
import { useUnknownDeviceConfig } from "./hooks/use-unknown-device.config"

interface UnknownDeviceScreenProps {
  iframe?: boolean
}

export const UnknownDeviceScreen: React.FC<UnknownDeviceScreenProps> = ({
  iframe,
}) => {
  const { applicationName } = useMultipass()
  const { identityManager } = useAuthentication()
  const { createDevice } = useDevices()
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

  useInterval(handlePollForDelegate, 2000)

  const handleNewDevice = React.useCallback(
    async (event) => {
      if (!userNumber) throw new Error("No userNumber found")

      const { publicKey: pubKey } = event.data.device

      await createDevice({
        ...event.data.device,
        userNumber,
      })

      const allDevices = await IIConnection.lookupAll(BigInt(userNumber))
      const publicKey = Array.from(blobFromHex(pubKey)).toString()
      const matchDevice = allDevices.find((item) => {
        return item.pubkey.toString() === publicKey
      })
      if (!matchDevice) throw new Error("Device creation failed")

      await Promise.all([
        readAccount(identityManager, userNumber),
        getPersona(),
      ])

      handleSendDelegate()
    },
    [
      createDevice,
      getPersona,
      handleSendDelegate,
      identityManager,
      readAccount,
      userNumber,
    ],
  )

  useMessageChannel({
    messageHandler: {
      "new-device": handleNewDevice,
    },
  })

  return (
    <div className={clsx("relative")}>
      {/* IFrameAuthorizeAppUnkownDevice */}
      {!showRegister && url && iframe ? (
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

      {!showRegister && url && !iframe ? (
        <AppScreen>
          <AuthorizeAppUnknownDevice
            applicationName={applicationName}
            url={url}
            onLogin={() =>
              navigate(`${RAC.base}/${RAC.recoveryPhrase}`, {
                state: { from: "loginWithRecovery" },
              })
            }
          />
        </AppScreen>
      ) : null}
      {/* IFrameAuthorizeAppUnkownDevice(AwaitConfirmationState)  */}
      {isLoading && (
        <div className="fixed top-0 bottom-0 bg-white">
          <div className="flex flex-col items-center justify-center w-full h-full px-14">
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
            iframe
          />
        </IFrameScreen>
      )}
    </div>
  )
}
