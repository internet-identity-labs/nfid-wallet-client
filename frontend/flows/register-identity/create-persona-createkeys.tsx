import React, { useEffect, useState } from "react"
import clsx from "clsx"
import { Card } from "frontend/ui-utils/molecules/card"
import { CardTitle } from "frontend/ui-utils/molecules/card/title"
import { Link } from "react-router-dom"
import { CardAction } from "frontend/ui-utils/molecules/card/action"
import { Button } from "frontend/ui-utils/atoms/button"
import { AppScreen } from "frontend/ui-utils/templates/AppScreen"
import { FaceId } from "frontend/ui-utils/atoms/images/face-id"
import { CardBody } from "frontend/ui-utils/molecules/card/body"
import { HiCheckCircle } from "react-icons/hi"
import { Spinner } from "frontend/ui-utils/atoms/loader/spinner"

interface IdentityPersonaCreatekeysScreenProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IdentityPersonaCreatekeysScreen: React.FC<IdentityPersonaCreatekeysScreenProps> =
  ({ children, className }) => {
    const [keysCreated, setKeysCreated] = useState(false)
    const [anchorCreated, setAnchorCreated] = useState(false)
    const [recoveryPhaseCreated, setRecoveryPhaseCreated] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      setTimeout(() => setKeysCreated(true), 1000)
      setTimeout(() => setAnchorCreated(true), 2000)
      setTimeout(() => setRecoveryPhaseCreated(true), 3000)
      setTimeout(() => setLoading(false), 3000)

      setTimeout(() => {
        window.location.href = "/register-identity-persona-createkeys-complete"
      }, 5000)
    }, [])

    return (
      <AppScreen>
        <Card className={clsx("h-full flex flex-col sm:block", className)}>
          <CardTitle>Keys created for My Persona</CardTitle>
          <CardBody className="flex flex-col items-center">
            <div className="mb-4">
              <div className="flex flex-row space-x-4 items-center py-3">
                <HiCheckCircle
                  className={clsx(
                    "text-2xl",
                    keysCreated ? "text-black" : "text-gray-300",
                  )}
                />
                <div>Key created</div>
              </div>
              <div className="flex flex-row space-x-4 items-center py-3">
                <HiCheckCircle
                  className={clsx(
                    "text-2xl",
                    anchorCreated ? "text-black" : "text-gray-300",
                  )}
                />
                <div>Anchor created</div>
              </div>
              <div className="flex flex-row space-x-4 items-center py-3">
                <HiCheckCircle
                  className={clsx(
                    "text-2xl",
                    recoveryPhaseCreated ? "text-black" : "text-gray-300",
                  )}
                />
                <div>Create recovery phrase</div>
              </div>
            </div>
            {loading ? <Spinner className="w-12 h-12" /> : null}
          </CardBody>
          <CardAction bottom className="justify-center md:flex-col md:items-center">
            <FaceId className="mx-auto h-16 mb-4" />
            <Link
              to="/register-identity-persona-info"
              className="flex justify-center"
            >
              <Button block large filled>
                Use FaceID to create your persona
              </Button>
            </Link>
          </CardAction>
        </Card>
      </AppScreen>
    )
  }
