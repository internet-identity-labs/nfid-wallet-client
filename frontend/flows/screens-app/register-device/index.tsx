import { Button, Card, CardBody, H2, H5, Loader } from "frontend/ui-kit/src/index"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import React from "react"
import { useParams } from "react-router-dom"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import { usePostMessage } from "frontend/hooks/use-post-message"
import { useDeviceInfo } from "frontend/hooks/use-device-info"

type Status = "initial" | "loading" | "success"

export const RegisterDevice = () => {
  const [status, setStatus] = React.useState<Status>("initial")
  const { opener } = usePostMessage({
    // @ts-ignore TODO: fix this
    onMessage: (window, ev) => console.log(">> onMessage", { window, ev }),
  })

  const {
    platform: { device },
  } = useDeviceInfo()

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
    <AppScreen>
      <Card className="grid grid-cols-12 offset-header">
        <CardBody className="col-span-12 md:col-span-9 lg:col-span-7">
          <H2 className="mb-3">Trust this device</H2>

          <div>
            Prove you own this {device} by successfully unlocking it to trust
            this device.
          </div>

          <Button
            onClick={handleRegisterNewDevice}
            large
            secondary
            className="mt-8"
          >
            Prove I own this {device}
          </Button>
        </CardBody>
      </Card>
      <Loader isLoading={status === "loading"} />
    </AppScreen>
  )
}
