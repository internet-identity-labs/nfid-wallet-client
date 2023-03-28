import { Principal } from "@dfinity/principal"

import { isHex } from "@nfid-frontend/utils"

export const validateAddressField = (string: string) => {
  if (!string.length) return "This field cannot be empty"
  const value = string.replace(/\s/g, "")
  if (isHex(value) && value.length === 64) return true

  try {
    if (!!Principal.fromText(value) && value.length === 63) return true
  } catch {
    return "Incorrect account or principal ID"
  }
}

export const isNotEmpty = (value: string) => {
  if (value.length) return true
  return "This field cannot be empty"
}

export const isValidAddress = (value: string) => {
  if (isHex(value)) return true
  return "Not a valid address"
}

export const isValidPrincipalId = (value: string) => {
  try {
    if (Principal.fromText(value)) return true
  } catch {
    return "Not a valid principal ID"
  }
  return "Not a valid principal ID"
}

export const validateTransferAmountField =
  (balance?: number | string) => (value: string | number) => {
    if (Number(value) < 0) return "Transfer amount can't be negative value"
    if (Number(value) === 0) return "You can't send 0 ICP"
    if (balance && Number(balance) < Number(value)) return "Insufficient funds"
    return true
  }

export const makeAddressFieldValidation =
  (shouldAcceptAddress: boolean) => (value: string) => {
    if (typeof isNotEmpty(value) !== "boolean") return isNotEmpty(value)

    if (shouldAcceptAddress) {
      if (typeof isHex(value) !== "boolean") return isHex(value)
      return true
    }

    if (typeof isValidPrincipalId(value) !== "boolean")
      return isValidPrincipalId(value)

    return true
  }
