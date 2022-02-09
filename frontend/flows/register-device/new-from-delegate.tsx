import { Button, H5, Loader } from "frontend/ui-kit/src/index"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import React from "react"
import { useParams } from "react-router-dom"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import { usePostMessage } from "frontend/hooks/use-post-message"
import { useDeviceInfo } from "frontend/hooks/use-device-info"

type Status = "initial" | "loading" | "success"

export const RegisterNewFromDelegate = () => {
  const [status, setStatus] = React.useState<Status>("initial")
  const { opener } = usePostMessage({
    // @ts-ignore TODO: fix this
    onMessage: (window, ev) => console.log(">> onMessage", { window, ev }),
  })

  const { os } = useDeviceInfo()

  let { secret, userNumber } = useParams()
  const { createWebAuthNDevice } = useDevices()

  const handleRegisterNewDevice = React.useCallback(async () => {
    setStatus("loading")
    if (!secret || !userNumber) {
      return console.error(
        `Missing secret: ${secret} or userNumber: ${userNumber} from url`,
      )
    }
    const { device } = await createWebAuthNDevice(BigInt(userNumber))
    opener?.postMessage({ kind: "new-device", device }, opener.origin)
    window.close()

    setStatus("success")
  }, [createWebAuthNDevice, opener, secret, userNumber])

  return (
    <AppScreen classNameWrapper="flex flex-1" isFocused>
      <div className="flex flex-col items-center justify-center w-full h-full max-w-sm mx-auto text-center">
        <H5 className="mb-3">Trust this browser</H5>

        <div>
          Prove you own this {os} by successfully unlocking it to trust this
          browser.
        </div>

        <Button
          onClick={handleRegisterNewDevice}
          large
          secondary
          className="mt-8"
        >
          I own this {os}
        </Button>
      </div>

      <Loader isLoading={status === "loading"} />
    </AppScreen>
  )
}
