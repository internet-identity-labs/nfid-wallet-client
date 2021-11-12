import React from "react"
import { useParams } from "react-router-dom"
import { useMultipass } from "frontend/hooks/use-ii-connection"
import { Button } from "frontend/ui-utils/atoms/button"
import clsx from "clsx"
import { TouchId } from "frontend/ui-utils/atoms/icons/touch-id"
import { Screen } from "frontend/ui-utils/atoms/screen"
import { getBrowser, getPlatform } from "../register/utils"
import { Loader } from "frontend/ui-utils/atoms/loader"

type Status = "initial" | "loading" | "success"

export const RegisterNewDevice = () => {
  const [status, setStatus] = React.useState<Status>("initial")
  const [opener, setOpener] = React.useState<Window | null>(null)
  let { secret, userNumber } =
    useParams<{ secret: string; userNumber: string }>()
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
    <Screen className={clsx("max-w-sm m-auto")}>
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
        className={clsx("bg-blue-700 text-white border-blue-900")}
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
  )
}
