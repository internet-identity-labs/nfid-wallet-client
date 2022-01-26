import {
  Button,
  Card,
  CardAction,
  CardBody,
  CardTitle,
  P,
} from "frontend/ui-kit/src/index"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import React from "react"
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
