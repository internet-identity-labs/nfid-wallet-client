import { Button, Card, CardAction, CardBody, CardTitle } from "@identity-labs/ui"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import React from "react"
import { Link } from "react-router-dom"

interface IdentityScreenProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IdentityScreen: React.FC<IdentityScreenProps> = ({
  children,
  className,
}) => {
  return (
    <AppScreen>
      <Card className={clsx("h-full flex flex-col sm:block", className)}>
        <CardTitle>Already have an Identity?</CardTitle>
        <CardBody className="text-center">
          You can create a new Identity or register this device with an existing
          Identity.
        </CardBody>
        <CardAction bottom className="justify-center">
          <Link to="/register-identity-name" className="flex justify-center">
            <Button text>I already have an Identity</Button>
          </Link>
          <Button filled>Create a new Identity</Button>
        </CardAction>
      </Card>
    </AppScreen>
  )
}
