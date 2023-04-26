import { Principal } from "@dfinity/principal"

import { isHex } from "@nfid-frontend/utils"

const PRINCIPAL_LENGTH = 63
const IC_ADDRESS_LENGTH = 64
const ETH_ADDRESS_LENGTH = 42

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
    if (Number(value) === 0) return "You can't send 0"
    if (balance && Number(balance) < Number(value)) return "Insufficient funds"
    return true
  }

export const makeAddressFieldValidation = (type: string) => (value: string) => {
  if (typeof isNotEmpty(value) !== "boolean") return isNotEmpty(value)

  switch (type) {
    case "ETH":
      return typeof isHex(value) === "boolean" &&
        value.length === ETH_ADDRESS_LENGTH
        ? true
        : "Incorrect address"
    case "ERC20":
      return typeof isHex(value) === "boolean" &&
        value.length === ETH_ADDRESS_LENGTH
        ? true
        : "Incorrect address"
    case "ERC20P":
      return typeof isHex(value) === "boolean" &&
        value.length === ETH_ADDRESS_LENGTH
        ? true
        : "Incorrect address"
    case "MATIC":
      return typeof isHex(value) === "boolean" &&
        value.length === ETH_ADDRESS_LENGTH
        ? true
        : "Incorrect address"
    case "BTC":
      return typeof isHex(value) === "boolean" &&
        value.length > 25 &&
        value.length < 36
        ? true
        : "Incorrect BTC address"
    case "DIP20":
      return typeof isValidPrincipalId(value) === "boolean" &&
        value.length === PRINCIPAL_LENGTH
        ? true
        : "For DIP20 only principal address allowed"
    default:
      return (typeof isHex(value) === "boolean" &&
        value.length === IC_ADDRESS_LENGTH) ||
        typeof isValidPrincipalId(value) === "boolean"
        ? true
        : "Incorrect account or principal ID"
  }
}
