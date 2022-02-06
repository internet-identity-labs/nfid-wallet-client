import {
  Button,
  Card,
  CardAction,
  CardBody,
  CardTitle,
  FaceId,
  Spinner,
} from "frontend/ui-kit/src/index"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useMultipass } from "frontend/hooks/use-multipass"
import { fromMnemonicWithoutValidation } from "frontend/services/internet-identity/crypto/ed25519"
import { generate } from "frontend/services/internet-identity/crypto/mnemonic"
import { ProofOfWork } from "frontend/services/internet-identity/generated/internet_identity_types"
import {
  IC_DERIVATION_PATH,
  IIConnection,
} from "frontend/services/internet-identity/iiConnection"
import React, { useState } from "react"
import { HiCheckCircle } from "react-icons/hi"
import { useLocation, useNavigate } from "react-router-dom"

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
  const { state } = useLocation()
  const { name, identity, deviceName, pow } = state as RegisterLocationState

  // const { onRegisterSuccess } = useAuthentication()
  const { updateAccount } = useMultipass()

  const navigate = useNavigate()
  const [anchorCreated, setAnchorCreated] = useState(false)
  const [recoveryPhaseCreated, setRecoveryPhaseCreated] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegisterAnchor = React.useCallback(async () => {
    console.log(">> handleRegisterAnchor disabled after II upgrade")

    // const webAuthnIdentity = WebAuthnIdentity.fromJSON(identity)
    // const response = await IIConnection.register(
    //   webAuthnIdentity,
    //   deviceName,
    //   pow,
    // )
    // if (response.kind === "loginSuccess") {
    //   const { userNumber } = response
    //   updateAccount({
    //     principal_id: webAuthnIdentity.getPrincipal().toString(),
    //     rootAnchor: userNumber.toString(),
    //   })
    // }
    // setAnchorCreated(true)
    // return response
  }, [])

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
    console.log(">> handleConfirm disabled after II upgrade")

    // setLoading(true)
    // const response = await handleRegisterAnchor()

    // if (response.kind === "loginSuccess") {
    //   const { userNumber, connection } = response
    //   onRegisterSuccess(connection)
    //   const recoveryPhrase = await handleCreateRecoveryPhrase(
    //     userNumber,
    //     connection,
    //   )
    //   setLoading(false)

    //   return navigate(`${RC.base}/${RC.recoveryPhrase}`, {
    //     state: { recoveryPhrase },
    //   })
    // }
    // console.error("handle this error")
  }, [])

  return (
    <AppScreen isFocused>
      <Card className={clsx("h-full flex flex-col sm:block", className)}>
        <CardTitle>Keys created for {name}</CardTitle>
        <CardBody className="flex flex-col items-center">
          <div className="mb-4">
            <div className="flex flex-row items-center py-3 space-x-4">
              <HiCheckCircle className={clsx("text-2xl", "text-black")} />
              <div>Key created</div>
            </div>
            <div className="flex flex-row items-center py-3 space-x-4">
              <HiCheckCircle
                className={clsx(
                  "text-2xl",
                  anchorCreated ? "text-black" : "text-gray-300",
                )}
              />
              <div>Anchor created</div>
            </div>
            <div className="flex flex-row items-center py-3 space-x-4">
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
        {!loading && (
          <CardAction
            bottom
            className="justify-center md:flex-col md:items-center"
          >
            <FaceId className="h-16 mx-auto mb-4" />
            <div className="flex justify-center">
              <Button block large secondary onClick={handleConfirm}>
                Use FaceID to finalize your persona
              </Button>
            </div>
          </CardAction>
        )}
      </Card>
    </AppScreen>
  )
}
