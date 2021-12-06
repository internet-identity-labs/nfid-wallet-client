import React, { useRef, useState } from "react"
import clsx from "clsx"
import { Card } from "frontend/design-system/molecules/card"
import { CardTitle } from "frontend/design-system/molecules/card/title"
import { CardBody } from "frontend/design-system/molecules/card/body"
import { P } from "frontend/design-system/atoms/typography/paragraph"
import { Link } from "react-router-dom"
import { CardAction } from "frontend/design-system/molecules/card/action"
import { Button } from "frontend/design-system/atoms/button"
import { AppScreen } from "frontend/design-system/templates/AppScreen"

interface IdentityPersonaInfoScreenProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IdentityPersonaInfoScreen: React.FC<IdentityPersonaInfoScreenProps> =
  ({ children, className }) => {
    return (
      <AppScreen>
        <Card className={clsx("h-full flex flex-col sm:block", className)}>
          <CardTitle>We're waiting here for you</CardTitle>
          <CardBody className="text-center max-w-lg">
            <P>
              Don't close or refresh this screen. We're waiting here for you to
              finish setting up the new device on Internet Identity.
            </P>
          </CardBody>
          <CardAction bottom className="justify-center">
            <Link
              to="/register-identity-persona-success"
              className="flex justify-center"
            >
              <Button block large filled>
                Log in with Internet Identity
              </Button>
            </Link>
          </CardAction>
        </Card>
      </AppScreen>
    )
  }
