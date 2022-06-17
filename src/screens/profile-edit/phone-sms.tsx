import clsx from "clsx"
import React from "react"
import { useForm } from "react-hook-form"
import { IoMdArrowBack } from "react-icons/io"
import { Link } from "react-router-dom"
import ReactCodeInput from "react-verification-code-input"

import {
  P,
  Logo,
  H4,
  Button,
  Input,
} from "@internet-identity-labs/nfid-sdk-react"

import { AppScreen } from "frontend/design-system/templates/AppScreen"

import { useTimer } from "frontend/hooks/use-timer"
import { isValidToken, tokenRules } from "frontend/utils/validations"

interface Account {
  anchor: string
  name?: string
}

interface ProfileEditPhoneSmsProps {
  account?: Account
  onResendCode: () => void
  onSubmit: () => void
  phone: string | number
}

export const ProfileEditPhoneSms: React.FC<ProfileEditPhoneSmsProps> = ({
  account,
  onResendCode,
  onSubmit,
  phone,
}) => {
  const {
    formState: { errors },
    setError,
    clearErrors,
  } = useForm({
    mode: "all",
  })
  const list = [...Array(6).keys()]
  const inputItemsRef = React.useRef<Array<HTMLInputElement | null>>([])
  const getVerificationCode = React.useCallback(
    () => inputItemsRef.current.map((item) => item?.value).join(""),
    [],
  )
  const { counter, setCounter } = useTimer({ defaultCounter: 3 })

  const handleResend = () => {
    onResendCode && onResendCode()
    setCounter(60)
  }

  const handleKeydown = React.useCallback((event: KeyboardEvent) => {
    if (event.key === "Backspace" || event.key === "Delete") {
      const currentFocus = document.activeElement
      const index = Number(currentFocus?.getAttribute("data-pin-index"))

      if (index && !inputItemsRef.current[index]?.value) {
        inputItemsRef.current[index - 1]?.focus()
      }
    }
  }, [])

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

  const handleInput = (e: { target: HTMLInputElement }, index: number) => {
    const validRegex = inputItemsRef.current[index]?.value.match(
      e.target.pattern,
    )

    if (validRegex) {
      if (index === list.length - 1) {
        inputItemsRef.current[index]?.blur()
      }

      inputItemsRef.current[index + 1]?.focus()
    } else {
      e.target.value = e.target.value[0]
    }
  }

  React.useEffect(() => {
    document.addEventListener("paste", handlePaste)
    document.addEventListener("keydown", handleKeydown)

    return () => {
      document.removeEventListener("paste", handlePaste)
    }
  }, [handleKeydown, handlePaste])

  const validateToken = () => {
    const verificationCode = getVerificationCode()

    if (verificationCode.length !== tokenRules.minLength) {
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
  }

  const handleSubmit = () => {
    if (!errors) onSubmit()
  }

  return (
    <AppScreen
      bubbleOptions={{
        showBubbles: true,
        bubbleColors: ["#a69cff", "#4df1ffa8"],
        bubbleClassNames: [
          "md:top-[40vh] md:left-[10vw]",
          "top-[20vh] left-[27vw] md:top-[60vh] md:left-[10vw]",
        ],
      }}
      navigationBar={false}
    >
      <main
        className={clsx(
          "w-full grid relative h-screen grid-rows-[100px_1fr]",
          "sm:grid-cols-[1fr,3fr] sm:grid-rows-none",
        )}
      >
        <div className="pt-5 pl-7">
          <Logo />
        </div>
        <div
          className={clsx(
            "relative py-6 px-5 bg-white flex flex-col",
            "sm:pr-[25%] sm:pl-24 sm:block",
          )}
        >
          <Link
            to={"/profile/authenticate"}
            className={clsx(
              "transition-opacity cursor-pointer top-8 left-10 hover:opacity-40",
              "sm:absolute",
            )}
          >
            <IoMdArrowBack className="w-5 h-5 text-black" />
          </Link>
          <H4 className="mt-5 sm:mt-0">SMS verification</H4>
          <P className="mt-3 text-sm sm:mt-14">
            Please enter the verification code that was sent to {phone}.
            <br />
            {counter > 0 ? (
              <P className="mt-3">Code can be resent in {counter} sec</P>
            ) : (
              <P className="mt-3">
                Didn’t receive a code?{" "}
                <span
                  className="cursor-pointer text-blue-base"
                  onClick={handleResend}
                >
                  Resend
                </span>
              </P>
            )}
          </P>
          <div
            className={clsx(
              "mt-5 flex flex-col justify-between flex-1",
              "sm:block",
            )}
          >
            <div className="flex space-x-3">
              {list.map((_, index) => (
                <Input
                  pin
                  type="number"
                  key={index}
                  autoFocus={index === 0}
                  data-pin-index={index}
                  ref={(el) => (inputItemsRef.current[index] = el)}
                  onChange={(e) => handleInput(e, index)}
                  maxLength={1}
                  pattern="^[0-9]{1}$"
                />
              ))}
            </div>
            <div className="py-1 text-sm text-red-base">
              {errors.verificationCode?.message || errors.phonenumber?.message}
            </div>
            <Button
              secondary
              className="px-10 sm:mt-5"
              onClick={() => {
                validateToken()
                handleSubmit()
              }}
            >
              Complete
            </Button>
          </div>
        </div>
      </main>
    </AppScreen>
  )
}
