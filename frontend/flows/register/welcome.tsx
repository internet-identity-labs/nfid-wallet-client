import React from "react"
import clsx from "clsx"
import { Card } from "frontend/design-system/molecules/card"
import { CardTitle } from "frontend/design-system/molecules/card/title"
import { CardBody } from "frontend/design-system/molecules/card/body"
import { Link } from "react-router-dom"
import { CardAction } from "frontend/design-system/molecules/card/action"
import { Button } from "frontend/design-system/atoms/button"
import { AppScreen } from "frontend/design-system/templates/AppScreen"

interface IdentityPersonaWelcomeScreenProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const RegisterWelcome: React.FC<IdentityPersonaWelcomeScreenProps> = ({
  className,
}) => {
  return (
    <AppScreen isFocused>
      <Card className={clsx("h-full flex flex-col sm:block", className)}>
        <CardTitle>Welcome</CardTitle>
        <CardBody className="text-center max-w-lg">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores,
          doloribus?
        </CardBody>
        <CardAction bottom className="justify-center">
          <Link to="/register-identity-persona" className="flex justify-center">
            <Button block large filled>
              Register
            </Button>
          </Link>
        </CardAction>
      </Card>
    </AppScreen>
  )
}
