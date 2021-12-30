import { WebAuthnIdentity } from "@dfinity/identity"
import {
  Button,
  Card,
  CardAction,
  CardBody,
  CardTitle,
  FaceId,
  P,
  Spinner
} from "@identity-labs/ui"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useMultipass } from "frontend/hooks/use-multipass"
import { fromMnemonicWithoutValidation } from "frontend/utils/internet-identity/crypto/ed25519"
import { generate } from "frontend/utils/internet-identity/crypto/mnemonic"
import { ProofOfWork } from "frontend/utils/internet-identity/generated/internet_identity_types"
import {
  IC_DERIVATION_PATH,
  IIConnection
} from "frontend/utils/internet-identity/iiConnection"
import React, { useState } from "react"
import { HiCheckCircle } from "react-icons/hi"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuthContext } from "../auth-wrapper"

interface RegisterLocationState {
  name: string
  identity: string
  deviceName: string
  pow: ProofOfWork
}

interface IdentityPersonaCreatekeysScreenProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const RegisterFinalizePersonaScreen: React.FC<
  IdentityPersonaCreatekeysScreenProps
> = ({ className }) => {
  const [error, setError] = React.useState(false)
  const { state } = useLocation()
  const { name, identity, deviceName, pow } = state as RegisterLocationState

  const { onRegisterSuccess } = useAuthContext()
  const { updateAccount, updatePersona } = useMultipass()

  const navigate = useNavigate()
  const [anchorCreated, setAnchorCreated] = useState(false)
  const [recoveryPhaseCreated, setRecoveryPhaseCreated] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegisterAnchor = React.useCallback(async () => {
    const webAuthnIdentity = WebAuthnIdentity.fromJSON(identity)
    const response = await IIConnection.register(
      webAuthnIdentity,
      deviceName,
      pow,
    )

    if (response.kind === "loginSuccess") {
      const { userNumber } = response
      updatePersona({
        principalId: webAuthnIdentity.getPrincipal().toString(),
        anchor: userNumber.toString(),
      })
    }
    setAnchorCreated(true)
    return response
  }, [deviceName, identity, pow, updatePersona])

  const handleCreateRecoveryPhrase = React.useCallback(
    async (userNumber: bigint, connection: IIConnection) => {
      const recovery = generate().trim()
      const recoverIdentity = await fromMnemonicWithoutValidation(
        recovery,
        IC_DERIVATION_PATH,
      )

      await connection.add(
        userNumber,
        "Recovery phrase",
        { seed_phrase: null },
        { recovery: null },
        recoverIdentity.getPublicKey().toDer(),
      )
      setRecoveryPhaseCreated(true)
      return recovery
    },
    [],
  )

  const handleConfirm = React.useCallback(async () => {
    setLoading(true)
    const response = await handleRegisterAnchor()

    if (response.kind === "loginSuccess") {
      const { userNumber, connection } = response
      onRegisterSuccess(connection)
      const recoveryPhrase = await handleCreateRecoveryPhrase(
        userNumber,
        connection,
      )
      setLoading(false)

      return navigate("/register/recovery-phrase", {
        state: { recoveryPhrase },
      })
    } else {
      setLoading(false)
      setError(true)
      throw new Error("Failed to register anchor")
    }
  }, [
    handleCreateRecoveryPhrase,
    handleRegisterAnchor,
    navigate,
    onRegisterSuccess,
  ])

  return (
    <AppScreen isFocused>
      <Card className={clsx("h-full flex flex-col sm:block", className)}>
        <CardTitle>Keys created for {name}</CardTitle>
        <CardBody className="flex flex-col items-center">
          <div className="mb-4">
            <div className="flex flex-row space-x-4 items-center py-3">
              <HiCheckCircle className={clsx("text-2xl", "text-black")} />
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
          {error && (
            <P className="text-red-400 font-bold">
              Something went wrong. Please try again.
            </P>
          )}
          {loading ? <Spinner className="w-12 h-12" /> : null}
        </CardBody>
        {!loading && (
          <CardAction
            bottom
            className="justify-center md:flex-col md:items-center"
          >
            <FaceId className="mx-auto h-16 mb-4" />
            <div className="flex justify-center">
              <Button block large filled onClick={handleConfirm}>
                Use FaceID to finalize your persona
              </Button>
            </div>
          </CardAction>
        )}
      </Card>
    </AppScreen>
  )
}
