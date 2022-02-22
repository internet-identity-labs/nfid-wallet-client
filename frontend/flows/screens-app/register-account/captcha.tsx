import { WebAuthnIdentity } from "@dfinity/identity"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { fromMnemonicWithoutValidation } from "frontend/services/internet-identity/crypto/ed25519"
import { generate } from "frontend/services/internet-identity/crypto/mnemonic"
import { getProofOfWork } from "frontend/services/internet-identity/crypto/pow"
import {
  Challenge,
  ChallengeResult,
  ProofOfWork,
} from "frontend/services/internet-identity/generated/internet_identity_types"
import {
  canisterIdPrincipal,
  IC_DERIVATION_PATH,
  IIConnection,
} from "frontend/services/internet-identity/iiConnection"
import { RefreshIcon } from "frontend/ui-kit/src/components/atoms/button/icons/refresh"
import {
  Button,
  Card,
  CardBody,
  H2,
  Input,
  Loader,
  P,
} from "frontend/ui-kit/src/index"
import { captchaRules } from "frontend/utils/validations"
import React from "react"
import { useForm } from "react-hook-form"
import {
  useLocation,
  useNavigate,
  useParams,
  generatePath,
} from "react-router-dom"
import { RegisterAccountConstants as RAC } from "./routes"

interface RegisterAccountCaptchaProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

interface RegisterPayload {
  pow: ProofOfWork
  identity: string
  deviceName: string
}

interface RegisterAccountCaptchaState {
  registerPayload: RegisterPayload
}

export const RegisterAccountCaptcha: React.FC<
  RegisterAccountCaptchaProps
> = () => {
  const { secret, scope } = useParams()
  console.log(">> RegisterAccountCaptcha", { secret, scope })

  const {
    register,
    formState: { errors, isValid, dirtyFields },
    handleSubmit,
    setError,
    setFocus,
    setValue,
  } = useForm({
    mode: "onTouched",
  })

  const isFormComplete = ["captcha"].every((field) => dirtyFields[field])

  const { state } = useLocation()
  const navigate = useNavigate()
  const { createAccount } = useAccount()

  const [captchaResp, setCaptchaResp] = React.useState<Challenge | undefined>()
  const [pow, setPow] = React.useState<ProofOfWork | null>(
    (state as RegisterAccountCaptchaState)?.registerPayload?.pow || null,
  )
  console.log(">> RegisterAccountCaptcha", { pow })

  const [loading, setLoading] = React.useState(true)

  const { onRegisterSuccess } = useAuthentication()

  const requestCaptcha = React.useCallback(async () => {
    setLoading(true)

    const now_in_ns = BigInt(Date.now()) * BigInt(1000000)
    const freshPow = pow ? pow : getProofOfWork(now_in_ns, canisterIdPrincipal)

    const cha = await IIConnection.createChallenge(freshPow)

    setCaptchaResp(cha)
    setLoading(false)
    setFocus("captcha")
    setPow(null)
  }, [pow, setFocus])

  React.useEffect(() => {
    requestCaptcha()

    return () => {
      setCaptchaResp(undefined)
    }
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

      const { registerPayload } = state as RegisterAccountCaptchaState

      const responseRegisterAnchor = await registerAnchor(
        registerPayload.identity,
        registerPayload.deviceName,
        captcha,
      )

      if (responseRegisterAnchor.kind === "loginSuccess") {
        const { userNumber, internetIdentity } = responseRegisterAnchor

        // TODO: fix the build issue
        // const recoveryPhrase = await createRecoveryPhrase(
        //   userNumber,
        //   internetIdentity,
        // )
        const recoveryPhrase = `typical cake decline asset trip motor jazz select mystery debris income muscle melt scare distance robust chief sell know wonder mixed reject accident blouse`

        await createAccount(responseRegisterAnchor.identityManager, {
          anchor: userNumber,
        })

        const navPath = generatePath(`${RAC.base}/${RAC.copyRecoveryPhrase}`, {
          secret,
          scope,
        })
        console.log(">> ", { navPath })

        return navigate(navPath, {
          state: {
            recoveryPhrase: `${userNumber} ${recoveryPhrase}`,
          },
        })
      }
      if (responseRegisterAnchor.kind === "badChallenge") {
        setValue("captcha", "")
        await requestCaptcha()
        setLoading(false)
        setError("captcha", {
          type: "manual",
          message: "Wrong captcha! Please try again",
        })
      }
      if (responseRegisterAnchor.kind === "apiError") {
        setLoading(false)
      }
    },
    [
      state,
      registerAnchor,
      createAccount,
      secret,
      scope,
      navigate,
      setValue,
      requestCaptcha,
      setError,
    ],
  )

  return (
    <AppScreen>
      <Card className="grid grid-cols-12 offset-header">
        <CardBody className="col-span-12 md:col-span-9 lg:col-span-6 xl:col-span-5">
          <H2 className="my-4">Captcha protected</H2>

          <P>Type the characters you see in the image.</P>

          <div>
            <div
              className={clsx(
                "h-[150px] w-auto rounded-md my-4",
                captchaResp ? "bg-white border border-gray-200" : "",
              )}
            >
              {captchaResp && !loading && (
                <img
                  src={`data:image/png;base64,${captchaResp.png_base64}`}
                  className="object-contain w-full h-full"
                />
              )}
            </div>

            <Button
              text
              className="flex items-center space-x-2 !my-1 ml-auto"
              onClick={() => requestCaptcha()}
            >
              <RefreshIcon />
              <span>Try a different image</span>
            </Button>

            <Input
              errorText={errors.captcha?.message}
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
          </div>

          <div className="my-3">
            <Button
              large
              block
              secondary
              disabled={!isFormComplete || loading}
              onClick={handleSubmit(completeNFIDProfile)}
              data-captcha-key={captchaResp?.challenge_key}
            >
              <span>Verify</span>
            </Button>
            <Loader isLoading={loading} />
          </div>
        </CardBody>
      </Card>
    </AppScreen>
  )
}
