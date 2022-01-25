import React from "react"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import {
  Button,
  Card,
  CardAction,
  CardBody,
  CardTitle,
  H4,
  Spinner,
} from "@identity-labs/ui"

import { HiCheckCircle } from "react-icons/hi"
import { DeviceItem } from "frontend/services/identity-manager/devices/device-item

interface AwaitingConfirmationProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const AwaitingConfirmation: React.FC<AwaitingConfirmationProps> = ({
  className,
}) => {
  const [deviceLinked, setDeviceLinked] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const device = { alias: "iPhone X", pubkey: [] }

  return (
    <AppScreen isFocused>
      <Card className="flex flex-col h-full">
        <CardTitle>Link another Access Point?</CardTitle>
        <CardBody className="w-full max-w-xl">
          <div className="mb-4">
            <div className="flex flex-row space-x-4 items-center py-3">
              <HiCheckCircle className={clsx("text-2xl", "text-black")} />
              <div>Key created</div>
            </div>
            <div className="flex flex-row space-x-4 items-center py-3">
              <HiCheckCircle
                className={clsx(
                  "text-2xl",
                  deviceLinked ? "text-black" : "text-gray-300",
                )}
              />
              <div>Device linked</div>
            </div>
          </div>
          {loading ? <Spinner className="w-12 h-12" /> : null}
          <H4 className="my-6 text-center">This device</H4>
          <DeviceItem
            device={device}
            key={device.alias}
            refresh={() => console.log(">> refresh")}
          />
        </CardBody>
        <CardAction
          bottom
          className="justify-center md:flex-col md:items-center"
        >
          <div className="flex flex-col justify-center">
            <Button large text onClick={() => console.log(">> click")}>
              show QR Code to scan
            </Button>
            <Button large filled onClick={() => console.log(">> click")}>
              copy link
            </Button>
          </div>
        </CardAction>
      </Card>
    </AppScreen>
  )
}
