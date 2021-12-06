import React from "react"
import clsx from "clsx"
import { Card } from "frontend/design-system/molecules/card"
import { CardTitle } from "frontend/design-system/molecules/card/title"
import { CardBody } from "frontend/design-system/molecules/card/body"
import { CardAction } from "frontend/design-system/molecules/card/action"
import { Button } from "frontend/design-system/atoms/button"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { Input } from "frontend/design-system/atoms/input"
import { P } from "frontend/design-system/atoms/typography/paragraph"
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
