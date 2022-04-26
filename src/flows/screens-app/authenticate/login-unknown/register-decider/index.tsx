import { Card, CardBody, Loader } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useUnknownDeviceConfig } from "frontend/flows/screens-iframe/authenticate/login-unknown/hooks/use-unknown-device.config"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { AuthorizeRegisterDecider } from "frontend/screens/authorize-register-decider"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useDevices } from "frontend/services/identity-manager/devices/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"

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
  const { getPersona } = usePersona()
  const { identityManager } = useAuthentication()
  const navigate = useNavigate()

  const { userNumber } = useUnknownDeviceConfig()
  const { createWebAuthNDevice } = useDevices()

  React.useEffect(() => {
    if (!window.PublicKeyCredential) navigate("/")
  }, [navigate])

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
                  navigate("/profile/authenticate")
                }}
                onLogin={() => {
                  navigate("/profile/authenticate")
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
