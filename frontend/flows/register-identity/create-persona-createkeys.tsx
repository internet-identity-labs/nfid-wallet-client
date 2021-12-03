import React, { useState } from "react"
import clsx from "clsx"
import { Card } from "frontend/ui-utils/molecules/card"
import { CardTitle } from "frontend/ui-utils/molecules/card/title"
import { useLocation, useNavigate } from "react-router-dom"
import { CardAction } from "frontend/ui-utils/molecules/card/action"
import { Button } from "frontend/ui-utils/atoms/button"
import { AppScreen } from "frontend/ui-utils/templates/AppScreen"
import { FaceId } from "frontend/ui-utils/atoms/images/face-id"
import { CardBody } from "frontend/ui-utils/molecules/card/body"
import { HiCheckCircle } from "react-icons/hi"
import { Spinner } from "frontend/ui-utils/atoms/loader/spinner"
import {
  IC_DERIVATION_PATH,
  IIConnection,
} from "frontend/ii-utils/iiConnection"
import { fromMnemonicWithoutValidation } from "frontend/ii-utils/crypto/ed25519"
import { generate } from "frontend/ii-utils/crypto/mnemonic"
import { WebAuthnIdentity } from "@dfinity/identity"
import { useAuthContext } from "../auth-wrapper"
import { useMultipass } from "frontend/hooks/use-multipass"

interface IdentityPersonaCreatekeysScreenProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const IdentityPersonaCreatekeysScreen: React.FC<IdentityPersonaCreatekeysScreenProps> =
  ({ className }) => {
    const {
      state: { name, identity, deviceName, pow },
    } = useLocation()
    const { onRegisterSuccess } = useAuthContext()
    const { updateAccount } = useMultipass()

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
        updateAccount({
          principalId: webAuthnIdentity.getPrincipal().toString(),
          rootAnchor: userNumber.toString(),
        })
      }
      setAnchorCreated(true)
      return response
    }, [deviceName, identity, pow, updateAccount])

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
      console.log(">> ", { response })

      if (response.kind === "loginSuccess") {
        const { userNumber, connection } = response
        onRegisterSuccess(connection)
        const recoveryPhrase = await handleCreateRecoveryPhrase(
          userNumber,
          connection,
        )
        setLoading(false)
        console.log(">> ", { recoveryPhrase })

        return navigate("/register-identity-persona-createkeys-complete", {
          state: { recoveryPhrase },
        })
      }
      console.error("handle this error")
    }, [
      handleCreateRecoveryPhrase,
      handleRegisterAnchor,
      navigate,
      onRegisterSuccess,
    ])

    return (
      <AppScreen>
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
