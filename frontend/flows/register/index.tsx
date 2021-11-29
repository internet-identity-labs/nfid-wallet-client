import { WebAuthnIdentity } from "@dfinity/identity"
import clsx from "clsx"
import { fromMnemonicWithoutValidation } from "frontend/ii-utils/crypto/ed25519"
import { generate } from "frontend/ii-utils/crypto/mnemonic"
import { getProofOfWork } from "frontend/ii-utils/crypto/pow"
import {
  canisterIdPrincipal,
  creationOptions,
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
import { DefaultWrapper } from "frontend/ui-utils/templates/DefaultWrapper"
import React from "react"
import { getBrowser, getPlatform } from "./utils"

type Status = "initial" | "loading" | "confirmation" | "success"

interface RegisterProps {
  onSuccess?: (connection: IIConnection) => void
}

export const Register: React.FC<RegisterProps> = ({ onSuccess }) => {
  const [userId, setUserId] = React.useState<bigint | null>(null)
  const [recovery, setRecovery] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<Status>("initial")
  const [registerPayload, setRegisterPayload] = React.useState<any | null>(null)

  const deviceName = React.useMemo(() => {
    const appName = getBrowser()
    const platform = getPlatform()
    return `${appName} on ${platform}`
  }, [])

  const handleCreateIdentity = React.useCallback(async () => {
    setStatus("loading")
    const identity = await WebAuthnIdentity.create({
      publicKey: creationOptions(),
    })
    const now_in_ns = BigInt(Date.now()) * BigInt(1000000)
    const pow = getProofOfWork(now_in_ns, canisterIdPrincipal)

    setRegisterPayload({ identity, deviceName, pow })
    setStatus("confirmation")
  }, [deviceName])

  const handleRegister = React.useCallback(async () => {
    setStatus("loading")
    const { identity, deviceName, pow } = registerPayload
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
    <DefaultWrapper title="Register">
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
            <div className={clsx("flex flex-col")}>
              <div className="font-bold">User ID:</div>
              <div>{userId?.toString()}</div>
            </div>

            <Divider />

            <div className={clsx("flex flex-col")}>
              <div className="font-bold">Recovery Phrase </div>
              <div>{recovery}</div>
            </div>
          </CardBody>
        )}

        {status === "confirmation" && (
          <div className={clsx("flex flex-row justify-center")}>
            <Button large filled onClick={handleRegister}>
              Confirm registration
            </Button>
          </div>
        )}
        <Loader isLoading={status === "loading"} />
      </Card>
    </DefaultWrapper>
  )
}
