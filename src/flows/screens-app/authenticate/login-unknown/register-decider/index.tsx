import { Card, CardBody, Loader } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React, { useState } from "react"
import {useNavigate} from "react-router-dom"

import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { AuthorizeRegisterDecider } from "frontend/screens/authorize-register-decider"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useUnknownDeviceConfig } from "frontend/flows/screens-iframe/authenticate/login-unknown/hooks/use-unknown-device.config"

interface AuthorizeRegisterDeciderProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const AppScreenAuthorizeRegisterDecider: React.FC<
  AuthorizeRegisterDeciderProps
> = ({ children, className }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { createDevice } = useDevices()
  const { readAccount } = useAccount()
  const { identityManager } = useAuthentication()
  const navigate = useNavigate()

  const { userNumber } = useUnknownDeviceConfig()
  const { createWebAuthNDevice } = useDevices()

  return (
    <AppScreen>
      <main className={clsx("flex flex-1")}>
        <div className="container px-6 py-0 mx-auto sm:py-4">
          <Card className="grid grid-cols-12">
            <CardBody className="col-span-12 lg:col-span-10 xl:col-span-6">
              <AuthorizeRegisterDecider
                iframe
                onRegister={async () => {
                    setIsLoading(true)
                    if (!userNumber) {
                      return console.error(`Missing userNumber: ${userNumber}`)
                    }

                    const { device } = await createWebAuthNDevice(BigInt(userNumber))
                    await createDevice({
                      ...device,
                      userNumber,
                    })
                    await readAccount(identityManager, userNumber)

                    setIsLoading(false)
                    navigate('/profile')
                }}
                onLogin={() => {
                  navigate('/profile')
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
