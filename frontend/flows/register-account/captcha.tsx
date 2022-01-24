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
import { useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useMultipass } from "frontend/hooks/use-multipass"
import { fromMnemonicWithoutValidation } from "frontend/utils/internet-identity/crypto/ed25519"
import { generate } from "frontend/utils/internet-identity/crypto/mnemonic"
import {
  Challenge,
  ChallengeResult,
  ProofOfWork,
} from "frontend/utils/internet-identity/generated/internet_identity_types"
import {
  canisterIdPrincipal,
  IC_DERIVATION_PATH,
  IIConnection,
} from "frontend/utils/internet-identity/iiConnection"
import { HiFingerPrint, HiRefresh } from "react-icons/hi"
import { RegisterAccountConstants as RAC } from "./routes"
import { WebAuthnIdentity } from "@dfinity/identity"
import { getProofOfWork } from "frontend/utils/internet-identity/crypto/pow"
import { captchaRules } from "frontend/utils/validations"

interface RegisterAccountCaptchaProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

interface RegisterAccountCaptchaState {
  registerPayload: {
    identity: string
    deviceName: string
    pow: ProofOfWork
  }
  name: string
  phonenumber: string
}

export const RegisterAccountCaptcha: React.FC<RegisterAccountCaptchaProps> = ({
  children,
  className,
}) => {
  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
    setValue,
    setError,
  } = useForm({
    mode: "all",
  })
  const { state } = useLocation()
  const navigate = useNavigate()
  const { updateAccount } = useMultipass()

  const [captchaResp, setCaptchaResp] = React.useState<Challenge | undefined>()
  const [loading, setLoading] = React.useState(true)

  const requestCaptcha = React.useCallback(async () => {
    setLoading(true)

    const now_in_ns = BigInt(Date.now()) * BigInt(1000000)
    const pow = getProofOfWork(now_in_ns, canisterIdPrincipal)
    const cha = await IIConnection.createChallenge(pow)

    setCaptchaResp(cha)
    setLoading(false)
  }, [])

  React.useEffect(() => {
    requestCaptcha()
  }, [requestCaptcha])

  const registerAnchor = React.useCallback(
    async (
      identity: string,
      deviceName: string,
      pow: ProofOfWork,
      captcha: string,
    ) => {
      if (!captchaResp) throw new Error("No challenge response")

      const webAuthnIdentity = WebAuthnIdentity.fromJSON(identity)

      const challengeResult: ChallengeResult = {
        chars: captcha,
        key: captchaResp.challenge_key,
      }

      const response = await IIConnection.register(
        webAuthnIdentity,
        deviceName,
        challengeResult,
      )

      if (response.kind === "badChallenge") {
        requestCaptcha()
      }

      if (response.kind === "loginSuccess") {
        const { userNumber } = response
        updateAccount({
          principal_id: webAuthnIdentity.getPrincipal().toString(),
          rootAnchor: userNumber.toString(),
        })
      }

      return response
    },
    [captchaResp, requestCaptcha, updateAccount],
  )

  const createRecoveryPhrase = React.useCallback(
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

  const completeNFIDProfile = React.useCallback(
    async (data: any) => {
      try {
        setLoading(true)

        const { captcha } = data
        const { registerPayload, name, phonenumber } =
          state as RegisterAccountCaptchaState

        const responseRegisterAnchor = await registerAnchor(
          registerPayload.identity,
          registerPayload.deviceName,
          registerPayload.pow,
          captcha,
        )

        if (
          responseRegisterAnchor &&
          responseRegisterAnchor.kind === "loginSuccess"
        ) {
          const { userNumber, connection } = responseRegisterAnchor

          const recoveryPhrase = await createRecoveryPhrase(
            userNumber,
            connection,
          )

          navigate(`${RAC.base}/${RAC.copyRecoveryPhrase}`, {
            state: {
              name,
              phonenumber,
              recoveryPhrase: `${userNumber.toString()} ${recoveryPhrase}`,
            },
          })
        }
      } catch {
        setValue("captcha", "")
        setError("captcha", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        })
        requestCaptcha()
      } finally {
        setCaptchaResp(undefined)
        setLoading(false)
      }
    },
    [state, registerAnchor, createRecoveryPhrase, navigate, setValue, setError, requestCaptcha],
  )

  return (
    <AppScreen isFocused>
      <Card className={clsx("h-full flex flex-col sm:block", className)}>
        <CardTitle>Enter Captcha</CardTitle>
        <CardBody className="max-w-lg">
          <P className="mt-2">Please type in the characters you see.</P>

          <div className="my-6">
            <div className="my-3">
              {captchaResp && (
                <img
                  src={`data:image/png;base64,${captchaResp.png_base64}`}
                  className="object-contain aspect-video"
                />
              )}

              <Input
                placeholder="Captcha"
                {...register("captcha", {
                  required: captchaRules.errorMessages.required,
                  minLength: {
                    value: captchaRules.minLength,
                    message: captchaRules.errorMessages.length,
                  },
                  maxLength: {
                    value: captchaRules.maxLength,
                    message: captchaRules.errorMessages.length,
                  },
                  pattern: {
                    value: captchaRules.regex,
                    message: captchaRules.errorMessages.pattern,
                  },
                })}
              />

              <P className="!text-red-400 text-sm">{errors.captcha?.message}</P>
            </div>
            <div className="my-3">
              <Button
                large
                block
                filled
                disabled={!isValid || loading}
                onClick={handleSubmit(completeNFIDProfile)}
                className="flex items-center justify-center mx-auto my-6 space-x-4"
                data-captcha-key={captchaResp?.challenge_key}
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
