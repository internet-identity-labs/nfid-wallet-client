import { Card } from "components/molecules/card"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { CardBody } from "frontend/ui-kit/src"
import React from "react"
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
