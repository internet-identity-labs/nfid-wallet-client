import React from "react"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { Card } from "@identity-labs/ui"
import { CardTitle } from "@identity-labs/ui"
import { CardBody } from "@identity-labs/ui"
import { H4 } from "@identity-labs/ui"
import { P } from "@identity-labs/ui"
import { CardAction } from "@identity-labs/ui"
import { Button } from "@identity-labs/ui"
import { HiShare } from "react-icons/hi"

interface RegisterDevicePromptSuccessScreenProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const RegisterDevicePromptSuccess: React.FC<
  RegisterDevicePromptSuccessScreenProps
> = ({ children, className }) => {
  return (
    <AppScreen isFocused>
      <Card className="flex flex-col h-full">
        <CardTitle>Great job! You signed in to your first dApp! 🎉</CardTitle>
        <CardBody>
          <P>You've fininshed the process faster than 56% of other users.</P>
        </CardBody>

        <CardAction bottom className="justify-center">
          <Button filled large className="flex items-center justify-center">
            <HiShare className="mr-2" />
            Tell your friends
          </Button>
        </CardAction>
      </Card>
    </AppScreen>
  )
}
