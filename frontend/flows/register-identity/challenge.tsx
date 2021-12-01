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
import { TouchId } from "frontend/ui-utils/atoms/images/touch-id"

interface IdentityChallengeProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IdentityChallengeScreen: React.FC<IdentityChallengeProps> = ({
  children,
  className,
}) => {
  return (
    <AppScreen>
      <Card className={clsx("h-full flex flex-col sm:block", className)}>
        <CardTitle>Register your NFID</CardTitle>
        <CardBody className="text-center max-w-lg">
          <P className="pb-3">
            Complete your registration by proving you are this phone's owner.
          </P>
          <P>
            Once you do, any application you browse from {"{BROWSER}"} that
            supports NFIDs will let you use Face ID to create accounts and log
            in.
          </P>

          <TouchId className="mx-auto w-[60px] mt-12" />
        </CardBody>
        <CardAction bottom className="justify-center">
          <Button large filled>
            Prove you are this phone's owner
          </Button>
        </CardAction>
      </Card>
    </AppScreen>
  )
}
