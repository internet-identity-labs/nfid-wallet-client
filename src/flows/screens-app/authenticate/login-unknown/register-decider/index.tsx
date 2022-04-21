import { Card, CardBody } from "@internet-identity-labs/nfid-sdk-react"
import React from "react"

import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { AuthorizeRegisterDecider } from "frontend/screens/authorize-register-decider"

interface AuthorizeRegisterDeciderProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const AppScreenAuthorizeRegisterDecider: React.FC<
  AuthorizeRegisterDeciderProps
> = ({ children, className }) => {
  return (
    <AppScreen>
      <Card className="grid grid-cols-12">
        <CardBody className="col-span-12 lg:col-span-10 xl:col-span-6">
          <AuthorizeRegisterDecider
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
