import { ButtonChevronIcon } from "components/atoms/button/icons/chevron"
import { AppScreen } from "frontend/design-system/templates/AppScreen"
import { useMultipass } from "frontend/hooks/use-multipass"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import {
  Button,
  Card,
  CardBody,
  H2,
  Input,
  Loader,
  P,
} from "frontend/ui-kit/src/index"
import { isValidToken, tokenRules } from "frontend/utils/validations"
import React, { useRef } from "react"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
import { RegisterAccountConstants as RAC } from "../routes"
import { ResendSMS } from "./resend-countdown"

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

  const { verifyPhonenumber } = useAccount()
  const { createWebAuthNIdentity } = useMultipass()

  const { name, phonenumber } = state as RegisterAccountState
  const [loading, setLoading] = React.useState(false)
  const [showCheckNumberButton, setShowCheckNumberButton] =
    React.useState(false)
  const list = [...Array(6).keys()]
  const inputItemsRef = useRef<Array<HTMLInputElement | null>>([])
  const getVerificationCode = React.useCallback(
    () => inputItemsRef.current.map((item) => item?.value).join(""),
    [],
  )

  const handlePaste = React.useCallback(
    (event: ClipboardEvent) => {
      const paste = event.clipboardData?.getData("text/plain")

      if (paste && isValidToken(paste)) {
        inputItemsRef.current.forEach((item, index) => {
          if (item) {
            item.value = paste[index]
            inputItemsRef.current[index]?.blur()
          }
        })

        clearErrors("verificationCode")
      }
    },
    [clearErrors],
  )

  const handleKeydown = React.useCallback((event: KeyboardEvent) => {
    if (event.key === "Backspace" || event.key === "Delete") {
      const currentFocus = document.activeElement
      const index = Number(currentFocus?.getAttribute("data-pin-index"))

      if (index && !inputItemsRef.current[index]?.value) {
        inputItemsRef.current[index - 1]?.focus()
      }
    }
  }, [])

  React.useEffect(() => {
    document.addEventListener("paste", handlePaste)
    document.addEventListener("keydown", handleKeydown)

    return () => {
      document.removeEventListener("paste", handlePaste)
    }
  }, [handleKeydown, handlePaste])

  const resendSMS = React.useCallback(async () => {
    setLoading(true)

    await verifyPhonenumber(phonenumber)

    inputItemsRef.current.forEach((item) => {
      item && (item.value = "")

      inputItemsRef.current[0]?.focus()
    })

    setShowCheckNumberButton(true)
    setLoading(false)
  }, [phonenumber, verifyPhonenumber])

  const handleVerifySMSToken = async () => {
    setLoading(true)
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

    // TODO: fix url
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
      <Card className="grid grid-cols-12 offset-header">
        <CardBody className="col-span-12 md:col-span-8">
          <H2>SMS verification</H2>
          <div className="my-5">
            <P className="pb-3">
              Please enter the verification code to verify your phone number.{" "}
              <br className="hidden sm:block" /> A code has been sent to{" "}
              {phonenumber}.
            </P>

            <ResendSMS defaultCounter={60} handleResend={resendSMS} />

            <div className="mt-6 mb-3">
              <div className="flex space-x-3">
                {list.map((_, index) => (
                  <Input
                    pin
                    type="number"
                    key={index}
                    autoFocus={index === 0}
                    data-pin-index={index}
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
                        e.target.value = e.target.value[0]
                      }
                    }}
                    maxLength={1}
                    pattern="^[0-9]{1}$"
                  />
                ))}
              </div>

              <div className="py-1 text-sm text-red-base">
                {errors.verificationCode?.message ||
                  errors.phonenumber?.message}
              </div>
            </div>
          </div>

          <Button
            large
            secondary
            onClick={handleVerifySMSToken}
            disabled={!isValidToken(getVerificationCode()) || loading}
          >
            <span>Complete</span>
          </Button>

          {showCheckNumberButton && (
            <Button
              text
              large
              icon
              className="mt-4"
              onClick={() => console.log(">> onClick check phone number", {})}
            >
              <ButtonChevronIcon />
              <span>Check phone number</span>
            </Button>
          )}

          <Loader isLoading={loading} />
        </CardBody>
      </Card>
    </AppScreen>
  )
}
