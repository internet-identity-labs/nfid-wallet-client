import React from "react"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { Card } from "@identitylabs/ui"
import { CardTitle } from "@identitylabs/ui"
import { CardBody } from "@identitylabs/ui"
import { H4 } from "@identitylabs/ui"
import { P } from "@identitylabs/ui"
import { CardAction } from "@identitylabs/ui"
import { Button } from "@identitylabs/ui"
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
