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
import { tokenRules } from "frontend/utils/validations"
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
  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
    setError,
  } = useForm({
    mode: "all",
  })

  const { createWebAuthNIdentity, verifyPhonenumber } = useMultipass()

  const { name, phonenumber } = state as RegisterAccountState
  const [loading, setLoading] = React.useState(false)

  const resendSMS = React.useCallback(async () => {
    setLoading(true)

    const { validPhonenumber } = await verifyPhonenumber(phonenumber)

    if (!validPhonenumber) {
      setError("phonenumber", {
        type: "manual",
        message: "Something went wrong. Please try again.",
      })
    }

    setLoading(false)
  }, [phonenumber, setError, verifyPhonenumber])

  const handleVerifySMSToken = async (data: any) => {
    const { verificationCode } = data
    const registerPayload = await createWebAuthNIdentity()

    navigate(`${RAC.base}/${RAC.captcha}`, {
      state: {
        name,
        phonenumber,
        registerPayload: registerPayload,
        verificationCode,
      },
    })
  }

  return (
    <AppScreen>
      <Card className={clsx("h-full flex flex-col sm:block", className)}>
        <CardTitle>SMS verification</CardTitle>
        <CardBody className="max-w-lg">
          <P className="pb-3">
            Please enter the verification code to verify your phone number. A
            code has been sent to {phonenumber}.
          </P>

          <P>
            Didn't receive a code?
            <Button text onClick={resendSMS} className="!px-1 !py-1 mx-2">
              Resend
            </Button>
          </P>
          <div className="mt-3">
            <Input
              placeholder="SMS code"
              {...register("verificationCode", {
                required: tokenRules.errorMessages.required,
                pattern: {
                  value: tokenRules.regex,
                  message: tokenRules.errorMessages.pattern,
                },
                minLength: {
                  value: tokenRules.minLength,
                  message: tokenRules.errorMessages.length,
                },
                maxLength: {
                  value: tokenRules.maxLength,
                  message: tokenRules.errorMessages.length,
                },
              })}
            />
            <P className="!text-red-400 text-sm">
              {errors.verificationCode?.message}
            </P>
          </div>

          <Button
            large
            block
            filled
            onClick={handleSubmit(handleVerifySMSToken)}
            disabled={!isValid || loading}
            className="flex items-center justify-center mx-auto my-6 space-x-4"
          >
            <HiFingerPrint className="text-lg" />

            <span>Verify my phone number</span>
          </Button>
          <Loader isLoading={loading} />
        </CardBody>
      </Card>
    </AppScreen>
  )
}
