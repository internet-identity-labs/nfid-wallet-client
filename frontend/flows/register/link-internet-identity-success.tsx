import React from "react"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { Card, CardTitle, CardAction, Button } from "frontend/ui-kit/src/index"
import { useStartUrl } from "frontend/hooks/use-start-url"

interface IdentityPersonaSuccessScreenProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const LinkInternetIdentitySuccessScreen: React.FC<
  IdentityPersonaSuccessScreenProps
> = ({ className }) => {
  const startUrl = useStartUrl()

  return (
    <AppScreen isFocused>
      <Card className={clsx("h-full flex flex-col sm:block", className)}>
        <CardTitle>Welcome! You're all set</CardTitle>
        <CardAction bottom className="justify-center">
          <a href={startUrl}>
            <Button large secondary>
              Log in to DSCVR
            </Button>
          </a>
        </CardAction>
      </Card>
    </AppScreen>
  )
}
