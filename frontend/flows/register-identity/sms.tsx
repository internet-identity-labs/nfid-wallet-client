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
import { HiRefresh } from "react-icons/hi"
import { Link } from "react-router-dom"

interface IdentitySmsProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IdentitySmsScreen: React.FC<IdentitySmsProps> = ({
  children,
  className,
}) => {
  return (
    <AppScreen>
      <Card className={clsx("h-full flex flex-col sm:block", className)}>
        <CardTitle>SMS verification</CardTitle>
        <CardBody className="text-center max-w-lg">
          <P className="pb-3">Please enter the SMS code you were just sent</P>
          <Input placeholder="33 44 55" />
          <Button
            text
            className="my-2 underline underline-offset-4 inline-flex items-center gap-4"
          >
            <HiRefresh className="text-lg" />
            Re-send code in 60s
          </Button>
        </CardBody>
        <CardAction bottom className="justify-center">
          <Link to="/register-identity-challenge" className="flex justify-center">
            <Button large filled block>
              Next
            </Button>
          </Link>
        </CardAction>
      </Card>
    </AppScreen>
  )
}
