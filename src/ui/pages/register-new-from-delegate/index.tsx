import clsx from "clsx"
import React from "react"
import { useParams } from "react-router-dom"

import {
  Card,
  CardBody,
  H2,
  Button,
  Loader,
} from "@internet-identity-labs/nfid-sdk-react"

import { useDeviceInfo } from "frontend/apps/device/use-device-info"
import { usePostMessage } from "frontend/apps/identity-provider/use-post-message"
import { ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST } from "frontend/integration/identity"
import { useDevices } from "frontend/integration/identity-manager/devices/hooks"
import { AppScreen } from "frontend/ui/templates/app-screen/AppScreen"

import { ModalSuccess } from "./modal-success"

type Status = "initial" | "loading" | "success"

export const RegisterNewFromDelegate = () => {
  const [status, setStatus] = React.useState<Status>("initial")
  const [showModal, setShowModal] = React.useState(false)
  const { opener } = usePostMessage({
    // @ts-ignore TODO: fix this
    onMessage: () => {},
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

      try {
        const { device } = await createWebAuthNDevice(BigInt(userNumber))
        opener?.postMessage({ kind: "new-device", device }, opener.origin)
      } catch (error: any) {
        if (!ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST.includes(error.message)) {
          throw error
        }
        console.debug("handleRegisterNewDevice", "device already registered")
      }

      setStatus("success")
      setShowModal(true)
    } catch {
      setStatus("initial")
      setShowModal(false)
    }
  }, [createWebAuthNDevice, opener, userNumber])

  return (
    <AppScreen>
      <main className={clsx("flex flex-1")}>
        <div className="container px-6 py-0 mx-auto sm:py-4">
          <Card className="grid grid-cols-12 lg:mt-[56px]">
            <CardBody className="col-span-12 md:col-span-9 lg:col-span-7">
              <H2 className="mb-3">Trust this device</H2>

              <div>
                Prove you own this {device} by successfully unlocking it to
                trust this device.
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
            <ModalSuccess device={device} onClick={() => setShowModal(false)} />
          ) : null}

          <Loader isLoading={status === "loading"} />
        </div>
      </main>
    </AppScreen>
  )
}
