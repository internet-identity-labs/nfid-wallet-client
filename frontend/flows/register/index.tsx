import clsx from "clsx"
import { useMultipass } from "frontend/hooks/use-multipass"
import { fromMnemonicWithoutValidation } from "frontend/ii-utils/crypto/ed25519"
import { generate } from "frontend/ii-utils/crypto/mnemonic"
import {
  IC_DERIVATION_PATH,
  IIConnection,
} from "frontend/ii-utils/iiConnection"
import { setUserNumber } from "frontend/ii-utils/userNumber"
import { Button } from "frontend/ui-utils/atoms/button"
import { Divider } from "frontend/ui-utils/atoms/divider"
import { Loader } from "frontend/ui-utils/atoms/loader"
import { P } from "frontend/ui-utils/atoms/typography/paragraph"
import { Card } from "frontend/ui-utils/molecules/card"
import { CardAction } from "frontend/ui-utils/molecules/card/action"
import { CardBody } from "frontend/ui-utils/molecules/card/body"
import { CardTitle } from "frontend/ui-utils/molecules/card/title"
import { AppScreen } from "frontend/ui-utils/templates/AppScreen"
import React from "react"

type Status = "initial" | "loading" | "confirmation" | "success"

interface RegisterProps {
  onSuccess?: (connection: IIConnection) => void
}

export const Register: React.FC<RegisterProps> = ({ onSuccess }) => {
  const [userId, setUserId] = React.useState<bigint | null>(null)
  const [recovery, setRecovery] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<Status>("initial")
  const [registerPayload, setRegisterPayload] = React.useState<any | null>(null)

  const { createWebAuthNIdentity } = useMultipass()

  const handleCreateIdentity = React.useCallback(async () => {
    setStatus("loading")
    const { identity, deviceName, pow } = await createWebAuthNIdentity()

    setRegisterPayload({ identity, deviceName, pow })
    setStatus("confirmation")
  }, [createWebAuthNIdentity])

  const handleRegister = React.useCallback(async () => {
    setStatus("loading")
    const { identity, deviceName, pow } = registerPayload
    debugger
    // TODO: this opens WebAuthN the second time
    const response = await IIConnection.register(identity, deviceName, pow)

    if (response.kind === "loginSuccess") {
      const { userNumber, connection } = response
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

      setUserId(userNumber)
      setUserNumber(userNumber)
      setRecovery(recovery)
      setStatus("success")
      onSuccess && onSuccess(connection)
    }

    setStatus("success")
  }, [onSuccess, registerPayload])

  return (
    <AppScreen title="Register">
      <Card className="h-full flex flex-col sm:block">
        <CardTitle>Welcome to Multipass</CardTitle>

        <Divider noGutters />

        {status === "initial" && (
          <>
            <CardBody>
              <P className="text-center">
                Do you want to stop using usernames and passwords and register?
              </P>
            </CardBody>
            <CardAction bottom className="justify-center">
              <Button large onClick={handleCreateIdentity}>
                Yes
              </Button>
            </CardAction>
          </>
        )}

        {status === "success" && (
          <CardBody>
            <div className={clsx("flex flex-col mb-6")}>
              <div className="font-bold">User ID:</div>
              <div>{userId?.toString()}</div>
            </div>

            <div className={clsx("flex flex-col")}>
              <div className="font-bold">Recovery Phrase </div>
              <div>{recovery}</div>
            </div>
          </CardBody>
        )}

        {status === "confirmation" && (
          <CardAction bottom className="justify-center">
            <Button large filled onClick={handleRegister}>
              Confirm registration
            </Button>
          </CardAction>
        )}
        <Loader isLoading={status === "loading"} />
      </Card>
    </AppScreen>
  )
}
