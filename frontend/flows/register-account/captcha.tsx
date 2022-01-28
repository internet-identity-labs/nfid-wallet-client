import { WebAuthnIdentity } from "@dfinity/identity"
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Input,
  Loader,
  P,
} from "frontend/ui-kit/src/index"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { fromMnemonicWithoutValidation } from "frontend/services/internet-identity/crypto/ed25519"
import { generate } from "frontend/services/internet-identity/crypto/mnemonic"
import {
  Challenge,
  ChallengeResult,
  ProofOfWork,
} from "frontend/services/internet-identity/generated/internet_identity_types"
import {
  IC_DERIVATION_PATH,
  IIConnection,
} from "frontend/services/internet-identity/iiConnection"
import { captchaRules } from "frontend/utils/validations"
import React from "react"
import { useForm } from "react-hook-form"
import { HiFingerPrint } from "react-icons/hi"
import { useLocation, useNavigate } from "react-router-dom"
import { RegisterAccountConstants as RAC } from "./routes"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { useAuthentication } from "../auth-wrapper"

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
  verificationCode: string
}

export const RegisterAccountCaptcha: React.FC<RegisterAccountCaptchaProps> = ({
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
  const { createAccount } = useAccount()

  const [captchaResp, setCaptchaResp] = React.useState<Challenge | undefined>()
  const [loading, setLoading] = React.useState(true)

  const { onRegisterSuccess } = useAuthentication()

  const requestCaptcha = React.useCallback(async () => {
    setLoading(true)

    const {
      registerPayload: { pow },
    } = state as RegisterAccountCaptchaState

    const cha = await IIConnection.createChallenge(pow)

    setCaptchaResp(cha)
    setLoading(false)
  }, [state])

  React.useEffect(() => {
    requestCaptcha()
  }, [requestCaptcha])

  const registerAnchor = React.useCallback(
    async (identity: string, deviceName: string, captcha: string) => {
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
      onRegisterSuccess(response)

      return response
    },
    [captchaResp, onRegisterSuccess],
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
    async ({ captcha }: any) => {
      setLoading(true)

      const { registerPayload, name, phonenumber, verificationCode } =
        state as RegisterAccountCaptchaState

      const responseRegisterAnchor = await registerAnchor(
        registerPayload.identity,
        registerPayload.deviceName,
        captcha,
      )

      if (responseRegisterAnchor.kind === "loginSuccess") {
        const { userNumber, internetIdentity } = responseRegisterAnchor

        const recoveryPhrase = await createRecoveryPhrase(
          userNumber,
          internetIdentity,
        )

        await createAccount(responseRegisterAnchor.identityManager, {
          name,
          phone_number: phonenumber,
          token: verificationCode,
          anchor: userNumber,
        })

        return navigate(`${RAC.base}/${RAC.copyRecoveryPhrase}`, {
          state: {
            recoveryPhrase: `${userNumber} ${recoveryPhrase}`,
          },
        })
      }
      if (responseRegisterAnchor.kind === "badChallenge") {
        setValue("captcha", "")
        setError("captcha", {
          type: "manual",
          message: "Wrong captcha! Please try again",
        })
        await requestCaptcha()
        setLoading(false)
      }
      if (responseRegisterAnchor.kind === "apiError") {
        setLoading(false)
      }
    },
    [
      state,
      registerAnchor,
      createRecoveryPhrase,
      createAccount,
      navigate,
      setValue,
      setError,
      requestCaptcha,
    ],
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
