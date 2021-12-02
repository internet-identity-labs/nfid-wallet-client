import React, { useRef, useState } from "react"
import clsx from "clsx"
import { Card } from "frontend/ui-utils/molecules/card"
import { CardTitle } from "frontend/ui-utils/molecules/card/title"
import { CardBody } from "frontend/ui-utils/molecules/card/body"
import { P } from "frontend/ui-utils/atoms/typography/paragraph"
import { Input } from "frontend/ui-utils/atoms/input"
import { Link } from "react-router-dom"
import { CardAction } from "frontend/ui-utils/molecules/card/action"
import { Button } from "frontend/ui-utils/atoms/button"
import { AppScreen } from "frontend/ui-utils/templates/AppScreen"
import { Switch } from "frontend/ui-utils/atoms/switch"
import { FaceId } from "frontend/ui-utils/atoms/images/face-id"

interface IdentityPersonaScreenProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IdentityPersonaScreen: React.FC<IdentityPersonaScreenProps> = ({
  children,
  className,
}) => {
  const [anchor, setAnchor] = useState("10013")

  const handleChange = (e: any) => {
    setAnchor(e.target.value)
  }
  return (
    <AppScreen>
      <Card className={clsx("h-full flex flex-col sm:block", className)}>
        <CardTitle>What should we call you?</CardTitle>
        <CardBody className="text-center max-w-lg">
          <P>
            Multipass allows you to register multiple Persona which you can use
            for authentication with dApps.
          </P>
          <P className="py-5">
            You can register a new Persona or link an existing Internet Identity
            Anchor.
          </P>
          <Input placeholder="Persona name" />
          <div className="flex justify-between py-5 space-x-4 items-center">
            <div className="text-sm md:text-base">
              Already have an II Anchor
            </div>
            <Switch />
          </div>
          <Input
            defaultValue={anchor}
            onChange={(e) => handleChange(e)}
            type="number"
          />
        </CardBody>
        <CardAction
          bottom
          className="justify-center md:flex-col md:items-center"
        >
          <FaceId className="mx-auto h-16 mb-4" />
          {anchor.length != 5 ? (
            <Button large filled disabled>
              Use FaceID to create keys for this device
            </Button>
          ) : (
            <Link
              to="/register-identity-persona-info"
              className="flex justify-center"
            >
              <Button block large filled>
                Use FaceID to create keys for this device
              </Button>
            </Link>
          )}
        </CardAction>
      </Card>
    </AppScreen>
  )
}
