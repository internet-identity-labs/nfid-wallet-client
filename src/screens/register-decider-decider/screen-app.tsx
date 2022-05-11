import { Card, CardBody, Loader } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React, { useState } from "react"
import { generatePath } from "react-router"
import { useNavigate, useParams } from "react-router-dom"

import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useUnknownDeviceConfig } from "frontend/screens/authorize-app-unknown-device/hooks/use-unknown-device.config"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"

import { RegisterDeviceDecider } from "."

interface AppScreenRegisterDeviceProps
  extends React.HTMLAttributes<HTMLDivElement> {
  registerDeviceSuccessPath: string
  loginSuccessPath: string
}

export const AppScreenRegisterDevice: React.FC<
  AppScreenRegisterDeviceProps
> = ({ registerDeviceSuccessPath, loginSuccessPath }) => {
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const { createDevice } = useDevices()
  const { readAccount } = useAccount()
  const { getPersona } = usePersona()
  const { identityManager } = useAuthentication()
  const navigate = useNavigate()

  const { userNumber } = useUnknownDeviceConfig()
  const { createWebAuthNDevice } = useDevices()

  return (
    <AppScreen isFocused>
      <main className={clsx("flex flex-1")}>
        <div className="container px-6 py-0 mx-auto sm:py-4">
          <Card className="grid grid-cols-12">
            <CardBody className="col-span-12 lg:col-span-10 xl:col-span-6">
              <RegisterDeviceDecider
                onRegister={async () => {
                  setIsLoading(true)
                  if (!userNumber) {
                    return console.error(`Missing userNumber: ${userNumber}`)
                  }

                  const { device } = await createWebAuthNDevice(
                    BigInt(userNumber),
                  )
                  await createDevice({
                    ...device,
                    userNumber,
                  })
                  await Promise.all([
                    readAccount(identityManager, userNumber),
                    getPersona(),
                  ])

                  setIsLoading(false)
                  navigate(generatePath(registerDeviceSuccessPath, params))
                }}
                onLogin={() => {
                  navigate(generatePath(loginSuccessPath, params))
                }}
              />

              <Loader isLoading={isLoading} fullscreen />
            </CardBody>
          </Card>
        </div>
      </main>
    </AppScreen>
  )
}
