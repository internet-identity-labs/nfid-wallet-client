import {
  Button,
  Card,
  CardAction,
  CardBody,
  CardTitle,
  Input,
  P,
} from "@identity-labs/ui"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import React from "react"
import { Link } from "react-router-dom"
import { PhoneNumberVerificationConstants as PNVC } from "./routes"

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
          <Link to={`${PNVC.base}/${PNVC.sms}`} className="flex justify-center">
            <Button large filled block>
              Next
            </Button>
          </Link>
        </CardAction>
      </Card>
    </AppScreen>
  )
}
