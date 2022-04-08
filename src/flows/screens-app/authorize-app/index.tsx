import { Card, CardBody } from "@identity-labs/nfid-sdk-react"
import React from "react"

import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { AuthorizeApp } from "frontend/screens/authorize-app"

interface AppScreenAuthorizeAppProps {}

export const AppScreenAuthorizeApp: React.FC<
  AppScreenAuthorizeAppProps
> = () => {
  return (
    <AppScreen isFocused>
      <Card className="grid grid-cols-12">
        <CardBody className="col-span-12 md:col-span-4">
          <AuthorizeApp />
        </CardBody>
      </Card>
    </AppScreen>
  )
}
