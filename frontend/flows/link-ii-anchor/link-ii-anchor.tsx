import { blobToHex } from "@dfinity/candid"
import { WebAuthnIdentity } from "@dfinity/identity"
import clsx from "clsx"
import { CONFIG } from "frontend/config"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useMultipass } from "frontend/hooks/use-multipass"
import {
  creationOptions,
  IIConnection,
} from "frontend/services/internet-identity/iiConnection"
import { parseUserNumber } from "frontend/services/internet-identity/userNumber"
import {
  Button,
  Card,
  CardAction,
  CardBody,
  CardTitle,
  Input,
  Loader,
  P,
} from "frontend/ui-kit/src/index"
import { anchorRules } from "frontend/utils/validations"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import { LinkIIAnchorConstants as LIIAC } from "./routes"

interface LinkIIAnchorProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const LinkIIAnchor: React.FC<LinkIIAnchorProps> = ({ className }) => {
  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
  } = useForm({
    mode: "all",
  })
  const { applicationName } = useMultipass()
  const navigate = useNavigate()

  const handleLinkAnchor = React.useCallback(
    async (data: any) => {
      const { anchor } = data
      console.log("anchor :>> ", anchor)
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

      navigate(`${LIIAC.base}/${LIIAC.keys}`, {
        replace: true, // seems to be important. Otherwise we're loosing Context??? Very weird.
        state: { iiDeviceLink: link, userNumber },
      })
    },
    [navigate],
  )

  return (
    <AppScreen isFocused>
      <Card className={clsx("h-full flex flex-col sm:block", className)}>
        <CardTitle>Link existing {applicationName} account</CardTitle>
        <CardBody className="text-center max-w-lg">
          <P>Enter the Internet Identity anchor you want to link with NFID:</P>

          <Input
            placeholder="Anchor ID"
            {...register("anchor", {
              required: anchorRules.errorMessages.required,
              pattern: {
                value: anchorRules.regex,
                message: anchorRules.errorMessages.pattern,
              },
              minLength: {
                value: anchorRules.minLength,
                message: anchorRules.errorMessages.length,
              },
            })}
          />

          <P className="!text-red-400 text-sm">{errors.anchor?.message}</P>
        </CardBody>

        <CardAction
          bottom
          className="justify-center md:flex-col md:items-center"
        >
          <div className="flex justify-center">
            <Button
              large
              filled
              disabled={!isValid}
              onClick={handleSubmit(handleLinkAnchor)}
            >
              Prove I own this access point
            </Button>
          </div>
        </CardAction>
      </Card>
    </AppScreen>
  )
}
