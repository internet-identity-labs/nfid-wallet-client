import { Card } from "components/molecules/card"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useUnknownDeviceConfig } from "frontend/flows/screens-iframe/authenticate/login-unknown/hooks/use-unknown-device.config"
import { useInterval } from "frontend/hooks/use-interval"
import { useMultipass } from "frontend/hooks/use-multipass"
import { CardBody, Loader } from "frontend/ui-kit/src"
import React from "react"
import { useLocation } from "react-router-dom"
import { AuthorizeRegisterDeciderContent } from "./content"

interface AuthorizeRegisterDeciderProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const AuthorizeRegisterDecider: React.FC<
  AuthorizeRegisterDeciderProps
> = ({ children, className }) => {
  // TODO: implement useUnknownDeviceConfig()?

  return (
    <AppScreen>
      <Card className="grid grid-cols-12">
        <CardBody className="col-span-12 lg:col-span-10 xl:col-span-6">
          <AuthorizeRegisterDeciderContent
            onRegister={() => {
              console.log("register me")
            }}
            onLogin={() => {
              console.log("log me in")
            }}
          />

          {/* <Loader isLoading={isLoading} /> */}
        </CardBody>
      </Card>
    </AppScreen>
  )
}
