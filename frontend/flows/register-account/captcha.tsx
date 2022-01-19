import React from "react"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  H3,
  Input,
  Label,
  Loader,
  P,
} from "@identity-labs/ui"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useMultipass } from "frontend/hooks/use-multipass"
import { fromMnemonicWithoutValidation } from "frontend/utils/internet-identity/crypto/ed25519"
import { generate } from "frontend/utils/internet-identity/crypto/mnemonic"
import { ProofOfWork } from "frontend/utils/internet-identity/generated/internet_identity_types"
import {
  IC_DERIVATION_PATH,
  IIConnection,
} from "frontend/utils/internet-identity/iiConnection"
import { HiFingerPrint, HiRefresh } from "react-icons/hi"
import { RegisterAccountConstants as RAC } from "./routes"
import { WebAuthnIdentity } from "@dfinity/identity"

interface RegisterAccountCaptchaProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const RegisterAccountCaptcha: React.FC<RegisterAccountCaptchaProps> = ({
  children,
  className,
}) => {
  const { register, watch } = useForm()
  const navigate = useNavigate()
  const { createWebAuthNIdentity, updateAccount } = useMultipass()

  const [loading, setLoading] = React.useState(false)
  const captcha = watch("captcha")

  const handleRegisterAnchor = React.useCallback(
    async (identity: string, deviceName: string, pow: ProofOfWork) => {
      const webAuthnIdentity = WebAuthnIdentity.fromJSON(identity)

      console.log("webAuthnIdentity :>> ", webAuthnIdentity)

      const response = await IIConnection.register(
        webAuthnIdentity,
        deviceName,
        pow,
      )

      if (response.kind === "loginSuccess") {
        const { userNumber } = response
        updateAccount({
          principal_id: webAuthnIdentity.getPrincipal().toString(),
          rootAnchor: userNumber.toString(),
        })
      }

      setLoading(false)
      return response
    },
    [updateAccount],
  )

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
      return recovery
    },
    [],
  )

  const handleCompleteNFIDProfile = React.useCallback(async () => {
    setLoading(true)

    try {
      const { identity, deviceName, pow } = await createWebAuthNIdentity()
      const responseRegisterAnchor = await handleRegisterAnchor(
        identity,
        deviceName,
        pow,
      )

      console.log("responseRegisterAnchor :>> ", responseRegisterAnchor)

      if (
        responseRegisterAnchor &&
        responseRegisterAnchor.kind === "loginSuccess"
      ) {
        const { userNumber, connection } = responseRegisterAnchor

        const recoveryPhrase = await handleCreateRecoveryPhrase(
          userNumber,
          connection,
        )

        console.log("recoveryPhrase :>> ", recoveryPhrase)

        // navigate(`${RAC.base}/${RAC.copyRecoveryPhrase}`, {
        //   state: {
        //     name,
        //     phonenumber,
        //     recoveryPhrase,
        //   },
        // })
      }
    } catch {
      throw new Error("Failed to complete NFID Profile")
    } finally {
      setLoading(false)
    }
  }, [createWebAuthNIdentity, handleCreateRecoveryPhrase, handleRegisterAnchor])

  return (
    <AppScreen isFocused>
      <Card className={clsx("h-full flex flex-col sm:block", className)}>
        <CardTitle>Enter Captcha</CardTitle>
        <CardBody className="max-w-lg">
          <P className="mt-2">Please type in the characters you see.</P>
          
          <div className="my-6">
            <div className="my-3">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Captcha-smwm.svg/1200px-Captcha-smwm.svg.png"
                className="object-contain aspect-video"
              />

              <Input
                placeholder="Captcha"
                {...register("captcha", { required: true })}
              />
            </div>
            <div className="my-3">
              <Button
                large
                block
                filled
                disabled={!captcha}
                onClick={handleCompleteNFIDProfile}
                className="flex justify-center space-x-4 items-center mx-auto my-6"
              >
                <HiFingerPrint className="text-lg" />
                <span>Create my NFID</span>
              </Button>
              <Loader isLoading={loading} />
            </div>
          </div>
        </CardBody>
      </Card>
    </AppScreen>
  )
}
