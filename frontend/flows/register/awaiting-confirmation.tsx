import { blobFromHex, derBlobFromBlob } from "@dfinity/candid"
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  FaceId,
  H4,
} from "frontend/ui-kit/src/index"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useInterval } from "frontend/hooks/use-interval"
import { ExistingDevices } from "frontend/services/identity-manager/devices/existing-devices"
import React from "react"
import { useParams } from "react-router"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { usePubSubChannel } from "frontend/services/pub-sub-channel/use-pub-sub-channel"

const MAX_TRIES = 10
const TRY_DELAY = 2000

type State = "loading" | "pause" | "success" | "error"

export const AwaitingConfirmation = () => {
  const { secret = "" } = useParams()
  const [status, setStatus] = React.useState<State>("loading")
  const { userNumber } = useAccount()
  const { getMessages } = usePubSubChannel()

  const { internetIdentity } = useAuthentication()

  // TODO:
  // - [ ] get device from communication channel
  const DEVICE = "MacBook Pro"

  const handlePoll = React.useCallback(
    async (cancelPoll: () => void, totalTries: number) => {
      const {
        body: [messages],
      } = await getMessages(secret)

      if (messages && messages.length > 0 && userNumber && internetIdentity) {
        const message = JSON.parse(messages[0] || "")
        await internetIdentity.add(
          userNumber,
          message.deviceName,
          { unknown: null },
          { authentication: null },
          derBlobFromBlob(blobFromHex(message.publicKey)),
          blobFromHex(message.rawId),
        )
        cancelPoll()
        setStatus("success")
      }

      if (totalTries >= MAX_TRIES) {
        cancelPoll()
        setStatus("pause")
        return
      }
    },
    [internetIdentity, getMessages, secret, userNumber],
  )

  const { start, resetTries } = useInterval(handlePoll, TRY_DELAY)

  const handleRetry = React.useCallback(() => {
    resetTries()
    setStatus("loading")
    start()
  }, [resetTries, start])

  return (
    <AppScreen isFocused>
      <Card className="flex flex-col h-full">
        <CardTitle>Awaiting confirmation</CardTitle>
        <CardBody className="w-full max-w-xl">
          <h1 className={clsx("text-center font-bold text-3xl")}></h1>
          <div className={clsx("text-center")}>
            Follow instructions on your {DEVICE}
          </div>
          <div className={clsx("flex justify-center mt-10")}>
            <FaceId />
          </div>
          {status === "success" && (
            <div className={clsx("text-center mt-40")}>
              Device has been registered!
            </div>
          )}
          {status === "pause" && (
            <div className="w-full py-12">
              <div className={clsx("text-center mb-4")}>
                Haven't received confirmation yet. Have you registered on your
                Mac?
              </div>
              <Button className="w-full" large onClick={handleRetry}>
                Retry
              </Button>
            </div>
          )}
          <H4 className="my-6 text-center">My Devices</H4>
          <ExistingDevices />
        </CardBody>
      </Card>
    </AppScreen>
  )
}
