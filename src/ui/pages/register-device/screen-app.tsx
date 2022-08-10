import clsx from "clsx"

import { Loader } from "@internet-identity-labs/nfid-sdk-react"

import { CONTAINER_CLASSES } from "frontend/ui/atoms/container"
import { AppScreen } from "frontend/ui/templates/app-screen/AppScreen"

import { RegisterDevice, RegisterDeviceProps } from "."

interface AppScreenRegisterDeviceProps extends RegisterDeviceProps {
  isLoading: boolean
}

export const AppScreenRegisterDevice: React.FC<
  AppScreenRegisterDeviceProps
> = ({ isLoading, onRegister }) => (
  <AppScreen isFocused showLogo>
    <main className={clsx("flex flex-1")}>
      <div className={clsx(CONTAINER_CLASSES)}>
        <div className="flex flex-col col-span-12 md:col-span-11 lg:col-span-7">
          <RegisterDevice onRegister={onRegister} />

          <Loader isLoading={isLoading} fullscreen />
        </div>
      </div>
    </main>
  </AppScreen>
)
