import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { AuthorizeApp } from "frontend/screens/authorize-app"
import { Card, CardBody } from "frontend/ui-kit/src/index"
import React from "react"

interface AppScreenAuthorizeAppProps {}

export const AppScreenAuthorizeApp: React.FC<
  AppScreenAuthorizeAppProps
> = () => {
  return (
    <AppScreen>
      <Card className="grid grid-cols-12">
        <CardBody className="col-span-12 md:col-span-4">
          <AuthorizeApp />
        </CardBody>
      </Card>
    </AppScreen>
  )
}
