import { Card, CardBody } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
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
      <main className={clsx("flex flex-1")}>
        <div className="container px-6 py-0 mx-auto sm:py-4">
          <Card className="grid grid-cols-12">
            <CardBody className="col-span-12 lg:col-span-10 xl:col-span-6">
              <AuthorizeRegisterDecider
                iframe
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
        </div>
      </main>
    </AppScreen>
  )
}
