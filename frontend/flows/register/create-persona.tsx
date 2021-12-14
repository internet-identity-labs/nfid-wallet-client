import React, { useRef, useState } from "react"
import clsx from "clsx"
import { Card } from "@identity-labs/ui"
import { CardTitle } from "@identity-labs/ui"
import { CardBody } from "@identity-labs/ui"
import { P, FaceId } from "@identity-labs/ui"
import { Input } from "@identity-labs/ui"
import { CardAction } from "@identity-labs/ui"
import { Button } from "@identity-labs/ui"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { Switch } from "@identity-labs/ui"
import { useForm } from "react-hook-form"
import { useMultipass } from "frontend/hooks/use-multipass"
import { Loader } from "@identity-labs/ui"
import { useNavigate } from "react-router"
import { parseUserNumber } from "frontend/utils/internet-identity/userNumber"
import {
  creationOptions,
  IIConnection,
} from "frontend/utils/internet-identity/iiConnection"
import { WebAuthnIdentity } from "@dfinity/identity"
import { blobToHex } from "@dfinity/candid"
import { CONFIG } from "frontend/config"

interface IdentityPersonaScreenProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const RegisterCreatePersonaScreen: React.FC<
  IdentityPersonaScreenProps
> = ({ className }) => {
  const [isLoading, setIslaoding] = useState(false)
  const { register, watch } = useForm()
  const [hasAnchor, setHasAnchor] = useState(false)

  const navigate = useNavigate()
  const { createWebAuthNIdentity } = useMultipass()

  const anchor = watch("anchor")
  const name = watch("name")

  const handleHasAnchor = React.useCallback(() => {
    setHasAnchor(!hasAnchor)
  }, [hasAnchor])

  const handleCreateIdentity = React.useCallback(async () => {
    setIslaoding(true)
    const registerPayload = await createWebAuthNIdentity()
    navigate("/register/finalize-persona", {
      state: {
        ...registerPayload,
        name,
      },
    })
  }, [createWebAuthNIdentity, name, navigate])

  const handleLinkAnchor = React.useCallback(async () => {
    const userNumber = parseUserNumber(anchor)
    if (!userNumber) {
      throw new Error("Invalid anchor")
    }

    const existingDevices = await IIConnection.lookupAll(userNumber)

    let identity
    try {
      identity = await WebAuthnIdentity.create({
        publicKey: creationOptions(existingDevices),
      })
    } catch (error) {
      return console.error({
        title: "Failed to authenticate",
        message:
          "We failed to collect the necessary information from your security device.",
        // @ts-ignore
        detail: error.message,
        primaryButton: "Try again",
      })
    }
    const publicKey = identity.getPublicKey().toDer()
    const rawId = blobToHex(identity.rawId)

    const url = new URL(
      CONFIG.II_ENV === "development"
        ? `http://${CONFIG.II_CANISTER_ID}.localhost:8000`
        : "https://identity.ic0.app",
    )
    url.pathname = "/"
    url.hash = `#device=${userNumber};${blobToHex(publicKey)};${rawId}`
    const link = encodeURI(url.toString())

    navigate("/register/link-internet-identity", {
      replace: true, // seems to be important. Otherwise we're loosing Context??? Very weird.
      state: { iiDeviceLink: link, userNumber },
    })
  }, [anchor, navigate])

  return (
    <AppScreen isFocused>
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
            <div className="flex justify-center">
              <Button
                large
                filled
                disabled={!anchor || anchor.length < 5}
                onClick={handleLinkAnchor}
              >
                Use FaceID to create keys for this device
              </Button>
            </div>
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
