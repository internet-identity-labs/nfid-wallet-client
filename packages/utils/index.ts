import * as React from "react"

import { MAX_DECIMAL_LENGTH } from "@nfid/integration/token/constants"

export const pressHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

    if (decimalPart && decimalPart.length > MAX_DECIMAL_LENGTH) {
      input.value = `${wholePart}.${decimalPart.substring(
        0,
        MAX_DECIMAL_LENGTH,
      )}`
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

    if (decimalDigits >= MAX_DECIMAL_LENGTH) {
      e.preventDefault()
    }
  }
}

export const pasteHandler = (e: React.ClipboardEvent<HTMLInputElement>) => {
  const pastedValue = e.clipboardData.getData("text/plain").replace(",", ".")
  const decimalIndex = pastedValue.indexOf(".")
  const $this = e.target as HTMLInputElement

  if (decimalIndex !== -1) {
    e.preventDefault()
    const decimalPart = pastedValue.substring(decimalIndex + 1)
    $this.value =
      pastedValue.substring(0, decimalIndex + 1) +
      decimalPart.substring(0, MAX_DECIMAL_LENGTH)
  }
}
