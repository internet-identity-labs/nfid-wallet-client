import React from "react"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { Button, Card, CardAction, CardBody, CardTitle, Spinner } from "@identitylabs/ui"
import { HiCheckCircle } from "react-icons/hi"
import { InputSelect } from "frontend/design-system/molecules/inputs/select"

interface CreateKeysScreenProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const CreateKeysScreen: React.FC<CreateKeysScreenProps> = () => {
  const [deviceLinked, setDeviceLinked] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
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
        </CardBody>
        <CardAction
          bottom
          className="justify-center md:flex-col md:items-center"
        >
          <div className="flex flex-col justify-center">
            <InputSelect
              id="device-select"
              name="device"
              options={[
                { value: "1", label: "iPhone X", selected: true },
                { value: "2", label: "MacBook Pro 13", selected: false },
              ]}
              onChange={(event) =>
                console.log(">> ", { value: event.target.value })
              }
            />
            <Button large filled onClick={() => console.log(">> click")}>
              use Face ID to create keys
            </Button>
          </div>
        </CardAction>
      </Card>
    </AppScreen>
  )
}
