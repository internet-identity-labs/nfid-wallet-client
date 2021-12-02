import React, { useRef, useState } from "react"
import clsx from "clsx"
import { Card } from "frontend/ui-utils/molecules/card"
import { CardTitle } from "frontend/ui-utils/molecules/card/title"
import { CardBody } from "frontend/ui-utils/molecules/card/body"
import { P } from "frontend/ui-utils/atoms/typography/paragraph"
import { Link } from "react-router-dom"
import { CardAction } from "frontend/ui-utils/molecules/card/action"
import { Button } from "frontend/ui-utils/atoms/button"
import { AppScreen } from "frontend/ui-utils/templates/AppScreen"

interface IdentityPersonaWelcomeScreenProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IdentityPersonaWelcomeScreen: React.FC<IdentityPersonaWelcomeScreenProps> =
  ({ children, className }) => {
    return (
      <AppScreen>
        <Card className={clsx("h-full flex flex-col sm:block", className)}>
          <CardTitle>Welcome</CardTitle>
          <CardBody className="text-center max-w-lg">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores, doloribus?
          </CardBody>
          <CardAction bottom className="justify-center">
            <Link
              to="/register-identity-persona"
              className="flex justify-center"
            >
              <Button block large filled>
                Register
              </Button>
            </Link>
          </CardAction>
        </Card>
      </AppScreen>
    )
  }
