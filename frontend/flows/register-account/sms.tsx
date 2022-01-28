import {
  Button,
  Card,
  CardBody,
  CardTitle,
  H2,
  Input,
  Loader,
  P,
} from "frontend/ui-kit/src/index"
import clsx from "clsx"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useMultipass } from "frontend/hooks/use-multipass"
import { isValidToken, tokenRules } from "frontend/utils/validations"
import React, { useRef } from "react"
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
    formState: { errors },
    setError,
    clearErrors,
  } = useForm({
    mode: "all",
  })

  const { createWebAuthNIdentity, verifyPhonenumber } = useMultipass()

  const { name, phonenumber } = state as RegisterAccountState
  const [loading, setLoading] = React.useState(false)

  const list = [...Array(6).keys()]
  const inputItemsRef = useRef<Array<HTMLInputElement | null>>([])

  const getVerificationCode = React.useCallback(
    () => inputItemsRef.current.map((item) => item?.value).join(""),
    [],
  )

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

  const handleVerifySMSToken = async () => {
    const verificationCode = getVerificationCode()

    if (verificationCode.length != tokenRules.minLength) {
      return setError("verificationCode", {
        type: "manual",
        message: tokenRules.errorMessages.length,
      })
    }

    if (!isValidToken(verificationCode)) {
      return setError("verificationCode", {
        type: "manual",
        message: tokenRules.errorMessages.pattern,
      })
    }

    clearErrors("verificationCode")

    const registerPayload = await createWebAuthNIdentity()

    navigate(`${RAC.base}/${RAC.captcha}`, {
      state: {
        name,
        phonenumber,
        registerPayload: registerPayload,
        verificationCode: verificationCode,
      },
    })
  }

  return (
    <AppScreen>
      <Card className="offset-header grid grid-cols-12">
        <CardBody className="col-span-12 md:col-span-8">
          <H2>SMS verification</H2>
          <div className="my-5">
            <P className="pb-3">
              Please enter the verification code to verify your phone number.{" "}
              <br className="hidden sm:block" /> A code has been sent to{" "}
              {phonenumber}.
            </P>

            <P>
              Didn't receive a code?
              <Button text onClick={resendSMS} className="!px-1 !py-1 mx-2">
                Resend
              </Button>
            </P>
            <div className="mt-6 mb-3">
              <div className="flex space-x-3">
                {list.map((_, index) => (
                  <Input
                    pin
                    key={index}
                    autoFocus={index === 0}
                    ref={(el) => (inputItemsRef.current[index] = el)}
                    onChange={(e) => {
                      const validRegex = inputItemsRef.current[
                        index
                      ]?.value.match(e.target.pattern)

                      if (isValidToken(getVerificationCode())) {
                        clearErrors("verificationCode")
                      } else {
                        setError("verificationCode", {
                          type: "manual",
                          message: tokenRules.errorMessages.length,
                        })
                      }

                      if (validRegex) {
                        if (index == list.length - 1) {
                          inputItemsRef.current[index]?.blur()
                        }

                        inputItemsRef.current[index + 1]?.focus()
                      } else {
                        e.target.value = e.target.value.replace(
                          /[^0-9]{1}$/,
                          "",
                        )
                      }
                    }}
                    maxLength={1}
                    pattern="^[0-9]{1}$"
                  />
                ))}
              </div>

              <div className="text-red-base text-sm py-1">
                {errors.verificationCode?.message}
              </div>
            </div>
          </div>

          <Button
            large
            icon
            filled
            onClick={handleVerifySMSToken}
            disabled={!isValidToken(getVerificationCode()) || loading}
          >
            <span>Complete</span>
          </Button>
          <Loader isLoading={loading} />
        </CardBody>
      </Card>
    </AppScreen>
  )
}
