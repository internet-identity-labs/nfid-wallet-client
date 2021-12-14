import React from "react"
import clsx from "clsx"
import { Card } from "@identity-labs/ui"
import { CardTitle } from "@identity-labs/ui"
import { CardBody } from "@identity-labs/ui"
import { CardAction } from "@identity-labs/ui"
import { Button } from "@identity-labs/ui"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { Input } from "@identity-labs/ui"
import { P } from "@identity-labs/ui"
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
