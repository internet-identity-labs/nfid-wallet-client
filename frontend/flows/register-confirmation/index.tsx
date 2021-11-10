import React from "react"
import clsx from "clsx"
import { useInterval } from "frontend/hooks/use-interval"
import { IIConnection } from "frontend/ii-utils/iiConnection"
import { Button } from "frontend/ui-utils/atoms/button"
import { FaceId } from "frontend/ui-utils/atoms/icons/face-id"
import { useParams } from "react-router"
import { getUserNumber } from "frontend/ii-utils/userNumber"
import { useAuthContext } from "../auth-wrapper"
import { blobFromHex, derBlobFromBlob } from "@dfinity/candid"
import { ExistingDevices } from "frontend/debug/existing-devices"

const MAX_TRIES = 10
const TRY_DELAY = 2000

type State = "loading" | "pause" | "success" | "error"

export const RegisterConfirmation = () => {
  const { secret } = useParams<{ secret: string }>()
  const [status, setStatus] = React.useState<State>("loading")
  const [confirmation, setConfirmation] = React.useState<any | null>(null)

  const userNumber = React.useMemo(() => getUserNumber(), [])
  const { connection } = useAuthContext()

  // TODO:
  // - [ ] poll for confirmation data (pubkey)
  // - [ ] get device from communication channel
  const DEVICE = "MacBook Pro"

  const handlePoll = React.useCallback(
    async (cancelPoll: () => void, totalTries: number) => {
      const messages = await IIConnection.getMessages(secret)
      if (messages.length > 0 && userNumber && connection) {
        const message = JSON.parse(messages[0] || "")
        const addResponse = await connection.add(
          userNumber,
          message.deviceName,
          { unknown: null },
          { authentication: null },
          derBlobFromBlob(blobFromHex(message.publicKey)),
          blobFromHex(message.rawId),
        )
        console.log(">> ", { addResponse })
        cancelPoll()
        setStatus("success")
      }

      if (totalTries >= MAX_TRIES) {
        console.log(">> total tries exceeded", { totalTries })
        cancelPoll()
        setStatus("pause")
        return
      }
    },
    [connection, secret, userNumber],
  )

  const { start, resetTries } = useInterval(handlePoll, TRY_DELAY)

  const handleRetry = React.useCallback(() => {
    resetTries()
    setStatus("loading")
    start()
  }, [resetTries, start])

  return (
    <div className={clsx("p-4 py-10 flex flex-col h-4/5")}>
      <h1 className={clsx("text-center font-bold text-3xl")}>
        Awaiting confirmation
      </h1>
      <div className={clsx("text-center")}>
        Follow instructions on your {DEVICE}
      </div>
      <div className={clsx("flex justify-center mt-10")}>
        <FaceId />
      </div>
      {status === "loading" && (
        <div className={clsx("text-center mt-40")}>
          This screen will update once you've registered your device
        </div>
      )}
      {status === "success" && (
        <div className={clsx("text-center mt-40")}>
          Device has been registered!
        </div>
      )}
      {status === "pause" && (
        <>
          <div className={clsx("text-center mt-40")}>
            Haven't received confirmation yet. Have you registered on your Mac?
          </div>
          <Button onClick={handleRetry}>Retry</Button>
        </>
      )}
      <ExistingDevices />
    </div>
  )
}
