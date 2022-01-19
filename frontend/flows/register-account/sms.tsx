import { WebAuthnIdentity } from "@dfinity/identity"
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Input,
  Loader,
  P,
} from "@identity-labs/ui"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useMultipass } from "frontend/hooks/use-multipass"
import { fromMnemonicWithoutValidation } from "frontend/utils/internet-identity/crypto/ed25519"
import { generate } from "frontend/utils/internet-identity/crypto/mnemonic"
import { ProofOfWork } from "frontend/utils/internet-identity/generated/internet_identity_types"
import {
  IC_DERIVATION_PATH,
  IIConnection,
} from "frontend/utils/internet-identity/iiConnection"
import React from "react"
import { useForm } from "react-hook-form"
import { HiFingerPrint, HiRefresh } from "react-icons/hi"
import { useLocation, useNavigate } from "react-router-dom"
import { RegisterAccountConstants as RAC } from "./routes"

interface RegisterAccountState {
  name: string
  phonenumber: string
}

interface RegisterAccountSMSVerificationProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

export const RegisterAccountSMSVerification: React.FC<
  RegisterAccountSMSVerificationProps
> = ({ children, className }) => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { register, watch } = useForm()

  const { createWebAuthNIdentity, updateAccount } = useMultipass()

  const { name, phonenumber } = state as RegisterAccountState
  const verificationCode = watch("verificationCode")

  const resendSMS = React.useCallback(() => {
    console.log("resendSMS")
  }, [])

  const handleVerifyPhonenumber = React.useCallback(async () => {
    // TODO: handle validation of token w backend

    const registerPayload = await createWebAuthNIdentity()

    navigate(`${RAC.base}/${RAC.captcha}`, {
      state: {
        name,
        phonenumber,
        registerPayload: registerPayload,
      },
    })
  }, [createWebAuthNIdentity, name, navigate, phonenumber])

  return (
    <AppScreen>
      <Card className={clsx("h-full flex flex-col sm:block", className)}>
        <CardTitle>SMS verification</CardTitle>
        <CardBody className="max-w-lg">
          <P className="pb-3">
            Please enter the verification code to verify your phone number. A
            code has been send to +1 234 856 7890. Didn't receive a code? Resend
          </P>
          <Input
            placeholder="SMS code"
            {...register("verificationCode", {
              required: true,
              valueAsNumber: true,
            })}
          />
          <Button
            text
            className="flex items-center gap-4 my-2 underline underline-offset-4"
            onClick={resendSMS}
          >
            <HiRefresh className="text-lg" />
            Re-send code in 60s
          </Button>

          <Button
            large
            block
            filled
            onClick={handleVerifyPhonenumber}
            disabled={!verificationCode}
            className="flex items-center justify-center mx-auto my-6 space-x-4"
          >
            <HiFingerPrint className="text-lg" />

            <span>Verify my phone number</span>
          </Button>
        </CardBody>
      </Card>
    </AppScreen>
  )
}
