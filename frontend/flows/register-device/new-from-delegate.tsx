import { Button, Loader, TouchId } from "frontend/ui-kit/src/index"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { getBrowser, getPlatform } from "frontend/utils"
import React from "react"
import { useParams } from "react-router-dom"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import { usePostMessage } from "frontend/hooks/use-post-message"

type Status = "initial" | "loading" | "success"

export const RegisterNewFromDelegate = () => {
  const [status, setStatus] = React.useState<Status>("initial")
  const { opener } = usePostMessage({
    // @ts-ignore TODO: fix this
    onMessage: (window, ev) => console.log(">> onMessage", { window, ev }),
  })

  let { secret, userNumber } = useParams()
  const { createWebAuthNDevice: handleAddDevice } = useDevices()

  // TODO: remove this and all dependants
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
    const { device } = await handleAddDevice(secret, BigInt(userNumber))
    opener?.postMessage({ kind: "new-device", device }, opener.origin)
    window.close()

    setStatus("success")
  }, [handleAddDevice, opener, secret, userNumber])

  return (
    <AppScreen>
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
    </AppScreen>
  )
}
