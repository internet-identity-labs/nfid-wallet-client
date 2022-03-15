import React from "react"
import { useParams } from "react-router-dom"

import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useDeviceInfo } from "frontend/hooks/use-device-info"
import { usePostMessage } from "frontend/hooks/use-post-message"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import { Button, Card, CardBody, H2, Loader } from "frontend/ui-kit/src/index"

import { ModalSuccess } from "./modal-success"

type Status = "initial" | "loading" | "success"

export const RegisterNewFromDelegate = () => {
  const [status, setStatus] = React.useState<Status>("initial")
  const [showModal, setShowModal] = React.useState(false)
  const { opener } = usePostMessage({
    // @ts-ignore TODO: fix this
    onMessage: (window, ev) => console.log(">> onMessage", { window, ev }),
  })

  const {
    platform: { device },
  } = useDeviceInfo()

  let { userNumber } = useParams()
  const { createWebAuthNDevice } = useDevices()
  const handleRegisterNewDevice = React.useCallback(async () => {
    try {
      setStatus("loading")

      if (!userNumber) {
        return console.error(`Missing userNumber: ${userNumber} from url`)
      }

      const { device } = await createWebAuthNDevice(BigInt(userNumber))
      opener?.postMessage({ kind: "new-device", device }, opener.origin)

      setStatus("success")
      setShowModal(true)
    } catch {
      setStatus("initial")
      setShowModal(false)
    }
  }, [createWebAuthNDevice, opener, userNumber])

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

      {status === "success" && showModal ? (
        <ModalSuccess onClick={() => setShowModal(false)} />
      ) : null}

      <Loader isLoading={status === "loading"} />
    </AppScreen>
  )
}
