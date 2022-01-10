import {
  Button,
  Card, CardAction, CardBody, CardTitle
} from "@identity-labs/ui"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import React from "react"
import { Link } from "react-router-dom"
import { RegisterConstants as RC } from "./routes"

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
          <Link to={`${RC.base}/${RC.createPersona}`} className="flex justify-center">
            <Button block large filled>
              Register
            </Button>
          </Link>
        </CardAction>
      </Card>
    </AppScreen>
  )
}
