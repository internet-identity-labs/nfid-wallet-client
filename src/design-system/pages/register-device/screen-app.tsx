import { Loader } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"

import { CONTAINER_CLASSES } from "frontend/design-system/atoms/container"
import { AppScreen } from "frontend/design-system/templates/app-screen/AppScreen"

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
