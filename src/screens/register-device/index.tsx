import {
  Button,
  Card,
  CardBody,
  H5,
  Loader,
} from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"

import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useDeviceInfo } from "frontend/hooks/use-device-info"

interface RegisterDeviceProps {
  onRegister: () => void
}

export const RegisterDevice: React.FC<RegisterDeviceProps> = ({
  onRegister,
}) => {
  const {
    platform: { device, authenticator },
  } = useDeviceInfo()
  return (
    <div>
      <H5 className="mb-4">Register this device to login</H5>
      <div>
        Trust this {device}? You can quickly and securely log in the next time
        using this device's {authenticator}.
      </div>
      <Button secondary onClick={onRegister}>
        Register device
      </Button>
    </div>
  )
}

interface AppScreenRegisterDeviceProps extends RegisterDeviceProps {
  isLoading: boolean
}

export const AppScreenRegisterDevice: React.FC<
  AppScreenRegisterDeviceProps
> = ({ isLoading, onRegister }) => (
  <AppScreen isFocused>
    <main className={clsx("flex flex-1")}>
      <div className="container px-6 py-0 mx-auto sm:py-4">
        <Card className="grid grid-cols-12">
          <CardBody className="col-span-12 lg:col-span-10 xl:col-span-6">
            <RegisterDevice onRegister={onRegister} />

            <Loader isLoading={isLoading} fullscreen />
          </CardBody>
        </Card>
      </div>
    </main>
  </AppScreen>
)
