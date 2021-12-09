import React from "react"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { Card } from "frontend/design-system/molecules/card"
import { CardTitle } from "frontend/design-system/molecules/card/title"
import { CardBody } from "frontend/design-system/molecules/card/body"
import { H4 } from "frontend/design-system/atoms/typography"
import { P } from "frontend/design-system/atoms/typography/paragraph"
import { CardAction } from "frontend/design-system/molecules/card/action"
import { Button } from "frontend/design-system/atoms/button"
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
