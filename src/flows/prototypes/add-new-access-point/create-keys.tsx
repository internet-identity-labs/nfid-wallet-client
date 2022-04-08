import {
  Button,
  Card,
  CardAction,
  CardBody,
  CardTitle,
  H4,
  P,
  Spinner,
} from "@identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"
import { useForm } from "react-hook-form"
import { HiCheckCircle } from "react-icons/hi"

import { InputSelect } from "frontend/design-system/molecules/inputs/select"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { getBrowser } from "frontend/utils"

interface CreateKeysScreenProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const CreateKeysScreen: React.FC<CreateKeysScreenProps> = () => {
  const [keysCreated] = React.useState(false)
  const [deviceLinked] = React.useState(false)
  const [loading] = React.useState(false)

  const platformAuth = "FaceID"
  const browserName = getBrowser()
  const deviceMake = "Apple"

  const { register, watch } = useForm({ defaultValues: { device: "1" } })
  const device = watch("device")

  return (
    <AppScreen isFocused>
      <Card className="flex flex-col h-full">
        <CardTitle>Register this access point</CardTitle>
        <CardBody className="w-full max-w-xl">
          <div className="mb-4">
            <div className="flex flex-row items-center py-3 space-x-4">
              <HiCheckCircle
                className={clsx(
                  "text-2xl",
                  keysCreated ? "text-black" : "text-gray-300",
                )}
              />
              <div>Key created</div>
            </div>
            <div className="flex flex-row items-center py-3 space-x-4">
              <HiCheckCircle
                className={clsx(
                  "text-2xl",
                  deviceLinked ? "text-black" : "text-gray-300",
                )}
              />
              <div>Device linked</div>
            </div>
          </div>
          <P>
            If you'd like to use {platformAuth} as your NFID "password" on
            supported {browserName} applications, prove you can unlock
            {platformAuth} to register this {deviceMake}
          </P>
          <div className={clsx("flex flex-col items-center")}>
            {loading ? <Spinner className="w-12 h-12" /> : null}
          </div>
        </CardBody>
        <CardAction
          bottom
          className="justify-center md:flex-col md:items-center"
        >
          <div className="flex flex-col justify-center">
            <H4 className={clsx("text-center")}>select device</H4>
            <div className={clsx("py-2")}>
              <InputSelect
                className={clsx("w-full rounded")}
                defaultValue={device}
                options={[
                  { value: "1", label: "iPhone X" },
                  { value: "2", label: "MacBook Pro 13" },
                ]}
                {...register("device", { required: true })}
              />
            </div>
            <Button large secondary onClick={() => console.log(">> click")}>
              use Face ID to create keys
            </Button>
          </div>
        </CardAction>
      </Card>
    </AppScreen>
  )
}
