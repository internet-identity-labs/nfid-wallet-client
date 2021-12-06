import React, { useRef, useState } from "react"
import clsx from "clsx"
import { Card } from "frontend/design-system/molecules/card"
import { CardTitle } from "frontend/design-system/molecules/card/title"
import { CardAction } from "frontend/design-system/molecules/card/action"
import { Button } from "frontend/design-system/atoms/button"
import { AppScreen } from "frontend/design-system/templates/AppScreen"

interface IdentityPersonaSuccessScreenProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IdentityPersonaSuccessScreen: React.FC<IdentityPersonaSuccessScreenProps> =
  ({ children, className }) => {
    return (
      <AppScreen>
        <Card className={clsx("h-full flex flex-col sm:block", className)}>
          <CardTitle>Welcome! You're all set</CardTitle>
          <CardAction bottom className="justify-center">
            <Button large filled>
              Log in to DSCVR
            </Button>
          </CardAction>
        </Card>
      </AppScreen>
    )
  }
