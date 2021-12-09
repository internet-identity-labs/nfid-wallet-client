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

interface IdentityPhoneScreenProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IdentityPhoneScreen: React.FC<IdentityPhoneScreenProps> = ({
  children,
  className,
}) => {
  return (
    <AppScreen>
      <Card className={clsx("h-full flex flex-col sm:block", className)}>
        <CardTitle>Phone Number</CardTitle>
        <CardBody className="text-center max-w-lg">
          <P className="pb-3">
            There is a limit of one NFID per person and multiple levels of
            verification that this rule is followed.
          </P>

          <P className="mb-8">
            Phone number verification is level 1 and required to register an
            NFID.
          </P>
          <Input placeholder="+38 123 333 444" />
        </CardBody>
        <CardAction bottom className="justify-center">
          <Link to="/register-identity-sms" className="flex justify-center">
            <Button large filled block>
              Next
            </Button>
          </Link>
        </CardAction>
      </Card>
    </AppScreen>
  )
}
