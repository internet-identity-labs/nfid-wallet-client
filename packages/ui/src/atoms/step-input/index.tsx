import clsx from "clsx"
import React from "react"
import { useForm } from "react-hook-form"

import { Button, Input, isValidToken, tokenRules } from "@nfid/ui"

interface StepInputProps {
  className?: string
  errorClasses?: string
  responseError?: string
  resetResponseError?: () => void
  onSubmit: (value: string) => Promise<void>
  buttonText?: string
  buttonClassName?: string
}

export const StepInput: React.FC<StepInputProps> = ({
  className,
  onSubmit,
  errorClasses,
  responseError,
  resetResponseError,
  buttonText,
  buttonClassName,
}) => {
  const [isFormValid, setIsFormValid] = React.useState(false)
  const list = Array.from(Array(6).keys())
  const inputItemsRef = React.useRef<Array<HTMLInputElement | null>>([])
  const {
    formState: { errors },
    setError,
    clearErrors,
    getFieldState,
  } = useForm<{ verificationCode: string; phonenumber: string }>({
    mode: "all",
  })

  const getVerificationCode = React.useCallback(
    () => inputItemsRef.current.map((item) => item?.value).join(""),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getFieldState("verificationCode")],
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

  const resetFormErrors = React.useCallback(() => {
    clearErrors("verificationCode")
    setIsFormValid(getVerificationCode().length === 6)
  }, [clearErrors, getVerificationCode])

  const handleInput = (e: { target: HTMLInputElement }, index: number) => {
    if (resetResponseError && responseError?.length) {
      resetResponseError()
      clearErrors("verificationCode")
    }
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

    setIsFormValid(getVerificationCode().length === 6)
  }

  React.useEffect(() => {
    document.addEventListener("paste", handlePaste)
    document.addEventListener("keydown", handleKeydown)

    return () => {
      document.removeEventListener("paste", handlePaste)
    }
  }, [handleKeydown, handlePaste])

  React.useEffect(() => {
    if (responseError?.length) {
      setError("verificationCode", {
        type: "manual",
        message: responseError,
      })
    } else resetFormErrors()
  }, [resetFormErrors, responseError, setError])

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

  const handleSubmit = React.useCallback(() => {
    if (!isFormValid) return
    onSubmit(getVerificationCode())
  }, [getVerificationCode, isFormValid, onSubmit])

  return (
    <div>
      <div id="pin-input" className={clsx("flex space-x-3", className)}>
        {list.map((_, index) => (
          <Input
            id={`pin-input-${index}`}
            pin
            type="number"
            key={index}
            autoFocus={index === 0}
            data-pin-index={index}
            ref={(el) => (inputItemsRef.current[index] = el)}
            onChange={(e) => handleInput(e, index)}
            maxLength={1}
            pattern="^[0-9]{1}$"
            isErrorStyles={!!errors.verificationCode?.message?.length}
          />
        ))}
      </div>
      <div
        id="pin-input-error"
        className={clsx("py-1 text-sm text-red-base", errorClasses)}
      >
        {errors.verificationCode?.message || errors.phonenumber?.message}
      </div>
      <Button
        id="send-pin"
        className={clsx("px-10 mt-3 sm:mt-5", buttonClassName)}
        onClick={() => {
          validateToken()
          handleSubmit()
        }}
        disabled={!isFormValid}
      >
        {buttonText}
      </Button>
    </div>
  )
}
