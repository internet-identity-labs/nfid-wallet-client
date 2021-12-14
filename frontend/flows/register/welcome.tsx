import React from "react"
import clsx from "clsx"
import { Card, IFrame } from "@identity-labs/ui"
import { CardTitle } from "@identity-labs/ui"
import { CardBody } from "@identity-labs/ui"
import { Link } from "react-router-dom"
import { CardAction } from "@identity-labs/ui"
import { Button } from "@identity-labs/ui"
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
          <Link to="/register/create-persona" className="flex justify-center">
            <Button block large filled>
              Register
            </Button>
          </Link>
        </CardAction>
      </Card>
    </AppScreen>
  )
}
