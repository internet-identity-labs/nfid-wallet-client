import clsx from "clsx"
import {
  forwardRef,
  KeyboardEvent,
  ClipboardEvent,
  InputHTMLAttributes,
} from "react"

import { Skeleton } from "../../atoms/skeleton"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  decimals: number
  isLoading: boolean
}

const pressHandler = (e: KeyboardEvent<HTMLInputElement>, decimals: number) => {
  const allowedKeys = /[0-9.]/
  const key = e.key
  const input = e.target as HTMLInputElement | null
  if (!input) return
  const value = input.value
  const cursorPosition = input.selectionStart ?? 0
  const dotPosition = value.indexOf(".")

  if (["ArrowLeft", "ArrowRight", "Backspace", "Delete"].includes(key)) {
    return
  }

  if (key === "." && !value.includes(".")) {
    const tempValue =
      value.slice(0, cursorPosition) + "." + value.slice(cursorPosition)
    const [wholePart, decimalPart] = tempValue.split(".")

    if (decimalPart && decimalPart.length > decimals) {
      input.value = `${wholePart}.${decimalPart.substring(0, decimals)}`
      input.setSelectionRange(cursorPosition, cursorPosition)
      e.preventDefault()
      return
    }
  }

  if (!allowedKeys.test(key) || (key === "." && value.includes("."))) {
    e.preventDefault()
    return
  }

  if (dotPosition !== -1 && cursorPosition > dotPosition) {
    const decimalPart = value.substring(dotPosition + 1)
    const decimalDigits = decimalPart.length

    if (decimalDigits >= decimals) {
      e.preventDefault()
    }
  }
}

const pasteHandler = (
  e: ClipboardEvent<HTMLInputElement>,
  decimals: number,
) => {
  const pastedValue = e.clipboardData.getData("text/plain").replace(",", ".")
  const decimalIndex = pastedValue.indexOf(".")
  const $this = e.target as HTMLInputElement

  if (decimalIndex !== -1) {
    e.preventDefault()
    const decimalPart = pastedValue.substring(decimalIndex + 1)
    $this.value =
      pastedValue.substring(0, decimalIndex + 1) +
      decimalPart.substring(0, decimals)
  }
}

export const InputAmount = forwardRef<HTMLInputElement, InputProps>(
  ({ decimals, disabled, isLoading = false, ...inputProps }, ref) => (
    <div className="relative h-10">
      {isLoading ? (
        <Skeleton className="absolute w-20 h-full !bg-gray-200 rounded-[6px]" />
      ) : (
        <input
          className={clsx(
            "min-w-0 text-[34px] font-semibold leading-10 bg-transparent",
            "outline-none border-none focus:ring-0 p-0 max-w-[160px] sm:max-w-[230px]",
            disabled ? "placeholder:text-gray-500" : "placeholder:text-black",
          )}
          placeholder="0.00"
          type="text"
          id="amount"
          min={0.0}
          onKeyDown={(e) => pressHandler(e, decimals)}
          onPaste={(e) => pasteHandler(e, decimals)}
          ref={ref}
          disabled={disabled}
          {...inputProps}
        />
      )}
    </div>
  ),
)
