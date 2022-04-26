import { Card, CardBody } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"

import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { AuthorizeApp } from "frontend/screens/authorize-app"

interface AppScreenAuthorizeAppProps {}

export const AppScreenAuthorizeApp: React.FC<
  AppScreenAuthorizeAppProps
> = () => {
  return (
    <AppScreen isFocused>
      <main className={clsx("flex flex-1")}>
        <div className="container px-6 py-0 mx-auto sm:py-4">
          <Card className="grid grid-cols-12">
            <CardBody className="col-span-12 md:col-span-4">
              <AuthorizeApp />
            </CardBody>
          </Card>
        </div>
      </main>
    </AppScreen>
  )
}
