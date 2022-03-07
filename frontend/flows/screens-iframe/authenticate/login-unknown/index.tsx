import clsx from "clsx"
import { IFrameScreen } from "frontend/design-system/templates/IFrameScreen"
import { useInterval } from "frontend/hooks/use-interval"
import { useMultipass } from "frontend/hooks/use-multipass"
import { Button, H5, Loader, QRCode } from "frontend/ui-kit/src/index"
import React from "react"
import { useNavigate } from "react-router-dom"
import { IFrameRestoreAccessPointConstants as RAC } from "../../restore-account/routes"
import { AuthorizeRegisterDecider } from "./authorize-register-decider"
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
          <H5 className="mb-4">Log in to {applicationName} with your NFID</H5>
          <div className="flex flex-col">
            <div>
              This application uses NFID, the most secure, private, and
              convenient Internet Identity.
            </div>

            <div className="py-5 m-auto">
              <a href={url} target="_blank">
                <QRCode content={url} options={{ margin: 0 }} />
              </a>
            </div>

            <Button
              text
              className="mb-2"
              onClick={() => navigate(`${RAC.base}/${RAC.recoveryPhrase}`)}
            >
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
          onLogin={() => handleSendDelegate}
        />
      )}
    </div>
  )
}
