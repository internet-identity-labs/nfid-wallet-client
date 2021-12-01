import React from "react"
import clsx from "clsx"
import { Card } from "frontend/ui-utils/molecules/card"
import { CardTitle } from "frontend/ui-utils/molecules/card/title"
import { CardBody } from "frontend/ui-utils/molecules/card/body"
import { CardAction } from "frontend/ui-utils/molecules/card/action"
import { Button } from "frontend/ui-utils/atoms/button"
import { AppScreen } from "frontend/ui-utils/templates/AppScreen"

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
        <CardAction bottom className="justify-center flex-col-reverse">
          <Button large text href="/register-identity-name">
            I already have an Identity
          </Button>
          <Button large filled>
            Create a new Identity
          </Button>
        </CardAction>
      </Card>
    </AppScreen>
  )
}
