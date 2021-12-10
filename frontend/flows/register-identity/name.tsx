import React from "react"
import clsx from "clsx"
import { Card } from "@identitylabs/ui"
import { CardTitle } from "@identitylabs/ui"
import { CardBody } from "@identitylabs/ui"
import { CardAction } from "@identitylabs/ui"
import { Button } from "@identitylabs/ui"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { Input } from "@identitylabs/ui"
import { P } from "@identitylabs/ui"
import { Link } from "react-router-dom"

interface IdentityNameScreenProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IdentityNameScreen: React.FC<IdentityNameScreenProps> = ({
  children,
  className,
}) => {
  return (
    <AppScreen>
      <Card className={clsx("h-full flex flex-col sm:block", className)}>
        <CardTitle>What should we call you?</CardTitle>
        <CardBody className="text-center max-w-lg">
          <P className="pb-8">
            You'll find using your full name most convenient, and rest assured
            you're the only person in the world with the permission to see this.
          </P>
          <Input placeholder="Enter your full name" />
        </CardBody>
        <CardAction bottom className="justify-center">
          <Link to="/register-identity-phone" className="flex justify-center">
            <Button block large filled>
              Next
            </Button>
          </Link>
        </CardAction>
      </Card>
    </AppScreen>
  )
}
