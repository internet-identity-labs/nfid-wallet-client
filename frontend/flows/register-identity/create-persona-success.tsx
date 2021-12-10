import React, { useRef, useState } from "react"
import clsx from "clsx"
import { Card } from "@identitylabs/ui"
import { CardTitle } from "@identitylabs/ui"
import { CardAction } from "@identitylabs/ui"
import { Button } from "@identitylabs/ui"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useAuthContext } from "../auth-wrapper"

interface IdentityPersonaSuccessScreenProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IdentityPersonaSuccessScreen: React.FC<
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
