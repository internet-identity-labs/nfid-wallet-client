import { blobToHex } from "@dfinity/candid"
import { WebAuthnIdentity } from "@dfinity/identity"
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
  CardBody,
  H2,
  Input,
  Modal,
  P,
} from "frontend/ui-kit/src/index"
import { anchorRules } from "frontend/utils/validations"
import React from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import { LinkIIAnchorConstants as LIIAC } from "./routes"

interface LinkIIAnchorProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const LinkIIAnchor: React.FC<LinkIIAnchorProps> = ({ className }) => {
  const [showModal, setShowModal] = React.useState(false)

  const {
    register,
    formState: { errors, isValid },
    resetField,
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
    <AppScreen>
      <Card className="offset-header grid grid-cols-12">
        <CardBody className="col-span-12 lg:col-span-8 xl:col-span-6">
          <H2 className="my-4">Link existing {applicationName} account</H2>

          <P>Enter the Internet Identity anchor you want to link with NFID:</P>

          <Input
            small
            autoFocus
            placeholder="Anchor ID"
            errorText={errors.anchor?.message}
            className="mt-4 mb-6"
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

          <Button
            secondary
            largeMax
            disabled={!isValid}
            onClick={handleSubmit(handleLinkAnchor)}
          >
            Prove I own this access point
          </Button>
        </CardBody>
      </Card>
      {showModal ? (
        <Modal
          title={"Oops"}
          description="It's impossible to link this Internet Identity anchor, please try another one."
          iconType="error"
          buttonText="Try another one"
          onClick={() => {
            resetField("anchor")
            setShowModal(false)
          }}
        />
      ) : null}
    </AppScreen>
  )
}
