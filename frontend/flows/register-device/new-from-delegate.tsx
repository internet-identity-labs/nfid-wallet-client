import { Button, H5, Loader, TouchId } from "frontend/ui-kit/src/index"
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
    <AppScreen classNameWrapper="flex flex-1" isFocused>
      <div className="h-full w-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
        <H5 className="mb-3">Trust this browser</H5>

        <div>
          Prove you own this {getPlatform()} by successfully unlocking it to
          trust this browser.
        </div>

        <Button
          onClick={handleRegisterNewDevice}
          large
          secondary
          className="mt-8"
        >
          I own this {getPlatform()}
        </Button>
      </div>

      <Loader isLoading={status === "loading"} />
    </AppScreen>
  )
}
