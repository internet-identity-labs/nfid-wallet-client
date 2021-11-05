import { WebAuthnIdentity } from "@dfinity/identity"
import clsx from "clsx"
import { LoginSuccess } from "frontend/ii-utils/api-result-to-login-result"
import { fromMnemonicWithoutValidation } from "frontend/ii-utils/crypto/ed25519"
import { generate } from "frontend/ii-utils/crypto/mnemonic"
import { getProofOfWork } from "frontend/ii-utils/crypto/pow"
import {
  canisterIdPrincipal,
  creationOptions,
  IC_DERIVATION_PATH,
  IIConnection,
} from "frontend/ii-utils/iiConnection"
import { Button } from "frontend/ui-utils/atoms/button"
import { Centered } from "frontend/ui-utils/atoms/centered"
import { Loader } from "frontend/ui-utils/atoms/loader"
import React from "react"
import { getBrowser, getPlatform } from "./utils"

export const Register = () => {
  const [userId, setUserId] = React.useState<bigint | null>(null)
  const [recovery, setRecovery] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<"initial" | "loading" | "success">(
    "initial",
  )

  const deviceName = React.useMemo(() => {
    const appName = getBrowser()
    const platform = getPlatform()
    return `${appName} on ${platform}`
  }, [])

  console.log(">> ", { deviceName })

  const handleRegister = React.useCallback(async () => {
    setStatus("loading")
    const identity = await WebAuthnIdentity.create({
      publicKey: creationOptions(),
    })
    const now_in_ns = BigInt(Date.now()) * BigInt(1000000)
    const pow = getProofOfWork(now_in_ns, canisterIdPrincipal)
    // TODO: this opens WebAuthN the second time
    const response = await IIConnection.register(identity, deviceName, pow)
    console.log(">> ", { response })

    if (response.kind === "loginSuccess") {
      const { userNumber, connection } = response
      const recovery = generate().trim()
      console.log(">> ", { recovery })

      const recoverIdentity = await fromMnemonicWithoutValidation(
        recovery,
        IC_DERIVATION_PATH,
      )

      console.log(">> ", { recoverIdentity })
      const recoveryResponse = await connection.add(
        userNumber,
        "Recovery phrase",
        { seed_phrase: null },
        { recovery: null },
        recoverIdentity.getPublicKey().toDer(),
      )
      console.log(">> ", { recoveryResponse })

      setUserId(userNumber)
      setRecovery(recovery)
      setStatus("success")
    }

    setStatus("success")
  }, [deviceName])

  return (
    <div className={clsx("p-4 py-10 flex flex-col h-4/5")}>
      <h1 className={clsx("text-center font-bold text-3xl")}>
        Welcome to Multipass
      </h1>
      <div className={clsx("flex-grow")} />
      {status === "initial" && (
        <>
          <p>Do you want to stop using usernames and passwords and register?</p>
          <div className={clsx("pt-3 flex flex-row space-x-3 justify-center")}>
            <Button onClick={handleRegister}>Yes</Button>
          </div>
        </>
      )}
      {status === "success" && (
        <>
          <div className={clsx("flex flex-col")}>
            <div>your user id </div>
            <div>{userId?.toString()}</div>
          </div>
          <div className={clsx("flex flex-col")}>
            <div>your recovery phrase </div>
            <div>{recovery}</div>
          </div>
        </>
      )}
      <Loader isLoading={status === "loading"} />
    </div>
  )
}
