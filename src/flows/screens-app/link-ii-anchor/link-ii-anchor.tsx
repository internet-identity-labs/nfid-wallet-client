import { blobToHex } from "@dfinity/candid"
import { WebAuthnIdentity } from "@dfinity/identity"
import { Li, Ol } from "components/atoms/typography/lists"
import { CONFIG } from "frontend/config"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
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
  const [showErrorModal, setShowErrorModal] = React.useState(false)
  const [showAlreadyLinkedModal, setShowAlreadyLinkedModal] =
    React.useState(false)
  const { identityManager } = useAuthentication()
  const { account, updateAccount } = useAccount()

  const {
    register,
    formState: { errors, isValid },
    resetField,
    handleSubmit,
  } = useForm({
    mode: "all",
  })

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
        if (account) {
          account.iiAnchors = Array.from(
            new Set([...(account.iiAnchors || []), userNumber.toString()]),
          )
          if (!identityManager) throw new Error("identityManager required")

          updateAccount(identityManager, account)
          setShowAlreadyLinkedModal(true)
        }
        return
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
    [account, identityManager, navigate, updateAccount],
  )

  return (
    <AppScreen>
      <Card className="grid grid-cols-12 offset-header">
        <CardBody className="col-span-12 lg:col-span-8 xl:col-span-6">
          <H2 className="my-4">
            Understanding the Internet Identity linking feature for NFID
          </H2>

          <P>
            NFID is developed by Internet Identity Labs, a company based in the
            US with funding from Tomahawk, Polychain, Joachim Breitner, Matt
            Symons, and RubyLight Ventures.
          </P>
          <P>
            Although our commitment is to build the most private, secure, and
            convenient self-sovereign internet identity, we are not yet a
            decentralized, tokenized protocol and therefore must earn your trust
            by being consistently honest with you.
          </P>
          <P>Honestly, linking your Internet Identity does two things:</P>
          <Ol>
            <Li>
              Replaces your Internet Identity frontend experience with NFID's
              (hopefully this is a big advantage and if it's not, please reach
              out and let us know how it could be better)
            </Li>
            <Li>
              Gives us <strong>a lot</strong> of control of your Internet
              Identity
            </Li>
          </Ol>
          <P>
            Do not do this unless you trust the team behind the project asking
            you to link Internet Identity anchors in this way.
          </P>
          <P>That includes us.</P>

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
      {showErrorModal ? (
        <Modal
          title={"Oops"}
          description="It's impossible to link this Internet Identity anchor, please try another one."
          iconType="error"
          buttonText="Try another one"
          onClick={() => {
            resetField("anchor")
            setShowErrorModal(false)
          }}
        />
      ) : null}
      {showAlreadyLinkedModal ? (
        <Modal
          title={"Looks like your anchor was already linked"}
          description="You can now use your anchor with NFID"
          buttonText="Done"
          onClick={() => {
            setShowAlreadyLinkedModal(false)
            window.close()
          }}
        />
      ) : null}
    </AppScreen>
  )
}
