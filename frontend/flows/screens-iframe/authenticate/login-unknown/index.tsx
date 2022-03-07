import clsx from "clsx"
import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { AuthorizeRegisterDeciderContent } from "frontend/flows/screens-app/authenticate/login-unknown/register-decider/content"
import { IFrameRestoreAccessPointConstants as RAC } from "frontend/flows/screens-iframe/restore-access-point/routes"
import { useInterval } from "frontend/hooks/use-interval"
import { useMultipass } from "frontend/hooks/use-multipass"
import { AuthorizeAppUnknownDevice } from "frontend/screens/authorize-app-unknown-device"
import { Loader } from "frontend/ui-kit/src/index"
import React from "react"
import { useNavigate } from "react-router-dom"
import { useUnknownDeviceConfig } from "./hooks/use-unknown-device.config"

interface UnknownDeviceScreenProps {}

export const UnknownDeviceScreen: React.FC<UnknownDeviceScreenProps> = ({}) => {
  const { applicationName } = useMultipass()

  const {
    status,
    url,
    newDeviceKey,
    showRegister,
    handleRegisterDevice,
    handleSendDelegate,
    handleWaitForRegisteredDeviceKey,
    handlePollForDelegate,
  } = useUnknownDeviceConfig()
  const isLoading = status === "loading"
  const navigate = useNavigate()

  useInterval(handlePollForDelegate, 2000)
  useInterval(handleWaitForRegisteredDeviceKey, 2000, !!newDeviceKey)

  return (
    <div className={clsx("relative", isLoading && "bg-white")}>
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

      {/* IFrameAuthorizeAppUnkownDevice(AwaitConfirmationState) */}
      {isLoading && (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
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
        <AuthorizeRegisterDeciderContent
          onRegister={handleRegisterDevice}
          onLogin={handleSendDelegate}
        />
      )}
    </div>
  )
}
