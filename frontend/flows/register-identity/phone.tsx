import React from "react"
import clsx from "clsx"
import { Card } from "frontend/ui-utils/molecules/card"
import { CardTitle } from "frontend/ui-utils/molecules/card/title"
import { CardBody } from "frontend/ui-utils/molecules/card/body"
import { CardAction } from "frontend/ui-utils/molecules/card/action"
import { Button } from "frontend/ui-utils/atoms/button"
import { AppScreen } from "frontend/ui-utils/templates/AppScreen"
import { Input } from "frontend/ui-utils/atoms/input"
import { P } from "frontend/ui-utils/atoms/typography/paragraph"

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
        <CardBody className="text-center max-w-xl">
          <P className="pb-3">
            There is a limit of one NFID per person and multiple levels of
            verification that this rule is followed.
          </P>

          <P>
            Phone number verification is level 1 and required to register an
            NFID.
          </P>
          <Input placeholder="+38 123 333 444" className="mt-8" />
        </CardBody>
        <CardAction bottom className="justify-center">
          <Button large filled href="/register-identity-sms">
            Next
          </Button>
        </CardAction>
      </Card>
    </AppScreen>
  )
}
