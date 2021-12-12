import React from "react"
import { useParams } from "react-router-dom"
import { useMultipass } from "frontend/hooks/use-multipass"
import { Button } from "@identitylabs/ui"
import clsx from "clsx"
import { TouchId } from "@identitylabs/ui"
import { Screen } from "@identitylabs/ui"
import { getBrowser, getPlatform } from "frontend/utils"
import { Loader } from "@identitylabs/ui"
import { AppScreen } from "frontend/design-system/templates/AppScreen"

type Status = "initial" | "loading" | "success"

export const NewFromDelegate = () => {
  const [status, setStatus] = React.useState<Status>("initial")
  const [opener, setOpener] = React.useState<Window | null>(null)
  let { secret, userNumber } = useParams()
  const { handleAddDevice } = useMultipass()

  const handleSendDeviceKey = React.useCallback(
    (pubKey) => {
      opener?.postMessage(
        { kind: "registered-device", deviceKey: pubKey },
        opener.origin,
      )
      window.close()
    },
    [opener],
  )

  const handleRegisterNewDevice = React.useCallback(async () => {
    setStatus("loading")
    if (!secret || !userNumber) {
      return console.error(
        `Missing secret: ${secret} or userNumber: ${userNumber} from url`,
      )
    }
    const response = await handleAddDevice(secret, BigInt(userNumber))
    handleSendDeviceKey(response.publicKey)
    setStatus("success")
  }, [handleAddDevice, handleSendDeviceKey, secret, userNumber])

  const waitForOpener = React.useCallback(async () => {
    setStatus("loading")
    const maxTries = 5
    let interval: NodeJS.Timer
    let run: number = 0

    interval = setInterval(() => {
      if (run >= maxTries) {
        clearInterval(interval)
      }
      if (window.opener !== null) {
        setOpener(window.opener)
        setStatus("initial")
        clearInterval(interval)
      }
    }, 500)
  }, [])

  React.useEffect(() => {
    waitForOpener()
  }, [waitForOpener])

  return (
    <AppScreen>
      <Screen className={clsx("max-w-sm m-auto p-7 py-10")}>
        <h1 className={clsx("text-center font-bold text-3xl")}>
          Register this device
        </h1>
        <div className={clsx("mt-10 text-center")}>
          If you'd like to use Face ID as your Multipass "password" on supported
          Safari applications, prove you can unlock Face ID to register this
          MacBook
        </div>
        <div className={clsx("my-10 mx-auto")}>
          <TouchId className={clsx("w-20")} />
        </div>
        <Button
          onClick={handleRegisterNewDevice}
          className={clsx("py-2 px-10 bg-blue-700 text-white border-blue-900")}
        >
          I want to use Touch ID as my Multipass "password" in {getBrowser()} on{" "}
          {getPlatform()}
        </Button>
        <a
          className={clsx("underline text-center mt-7 cursor-pointer")}
          onClick={() => window.close()}
        >
          cancel
        </a>
        <Loader isLoading={status === "loading"} />
      </Screen>
    </AppScreen>
  )
}
