import React, { useRef, useState } from "react"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useAuthContext } from "../auth-wrapper"
import { Card, CardTitle, CardAction, Button } from "frontend/ui-kit/src/index"

interface IdentityPersonaSuccessScreenProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const LinkInternetIdentitySuccessScreen: React.FC<
  IdentityPersonaSuccessScreenProps
> = ({ className }) => {
  const { startUrl } = useAuthContext()

  return (
    <AppScreen isFocused>
      <Card className={clsx("h-full flex flex-col sm:block", className)}>
        <CardTitle>Welcome! You're all set</CardTitle>
        <CardAction bottom className="justify-center">
          <a href={startUrl}>
            <Button large filled>
              Log in to DSCVR
            </Button>
          </a>
        </CardAction>
      </Card>
    </AppScreen>
  )
}
