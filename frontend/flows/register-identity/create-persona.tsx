import React, { useRef, useState } from "react"
import clsx from "clsx"
import { Card } from "frontend/ui-utils/molecules/card"
import { CardTitle } from "frontend/ui-utils/molecules/card/title"
import { CardBody } from "frontend/ui-utils/molecules/card/body"
import { P } from "frontend/ui-utils/atoms/typography/paragraph"
import { Input } from "frontend/ui-utils/atoms/input"
import { CardAction } from "frontend/ui-utils/molecules/card/action"
import { Button } from "frontend/ui-utils/atoms/button"
import { AppScreen } from "frontend/ui-utils/templates/AppScreen"
import { Switch } from "frontend/ui-utils/atoms/switch"
import { FaceId } from "frontend/ui-utils/atoms/images/face-id"
import { useForm } from "react-hook-form"
import { useMultipass } from "frontend/hooks/use-multipass"
import { Loader } from "frontend/ui-utils/atoms/loader"
import { useNavigate } from "react-router"

interface IdentityPersonaScreenProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IdentityPersonaScreen: React.FC<IdentityPersonaScreenProps> = ({
  className,
}) => {
  const [isLoading, setIslaoding] = useState(false)
  const { register, watch } = useForm()
  const [hasAnchor, setHasAnchor] = useState(false)

  const navigate = useNavigate()
  const { createWebAuthNIdentity } = useMultipass()

  const anchor = watch("anchor")
  const name = watch("name")

  const handleHasAnchor = React.useCallback(() => {
    console.log(">> handleHasAnchor", {})
    setHasAnchor(!hasAnchor)
  }, [hasAnchor])

  const handleCreateIdentity = React.useCallback(async () => {
    setIslaoding(true)
    const registerPayload = await createWebAuthNIdentity()
    navigate("/register-identity-persona-createkeys", {
      state: {
        ...registerPayload,
        name,
      },
    })
  }, [createWebAuthNIdentity, name, navigate])

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
          <Input
            placeholder="Persona name"
            {...register("name", { required: true })}
          />
          <div className="flex justify-between py-5 space-x-4 items-center">
            <div className="text-sm md:text-base">
              Already have an II Anchor
            </div>
            <Switch onChange={handleHasAnchor} isActive={hasAnchor} />
          </div>
          {hasAnchor && (
            <Input
              defaultValue={anchor}
              type="number"
              placeholder="Anchor ID"
              {...register("anchor")}
            />
          )}
        </CardBody>
        <CardAction
          bottom
          className="justify-center md:flex-col md:items-center"
        >
          <FaceId className="mx-auto h-16 mb-4" />
          {hasAnchor ? (
            <Button large filled disabled={anchor.length < 5}>
              Use FaceID to create keys for this device
            </Button>
          ) : (
            <div className="flex justify-center">
              <Button
                block
                large
                filled
                disabled={!name}
                onClick={handleCreateIdentity}
              >
                Use FaceID to create keys for this device
              </Button>
            </div>
          )}
          <Loader isLoading={isLoading} />
        </CardAction>
      </Card>
    </AppScreen>
  )
}
