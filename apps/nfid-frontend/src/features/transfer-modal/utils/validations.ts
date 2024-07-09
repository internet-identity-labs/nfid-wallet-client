import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"

import { isHex } from "@nfid-frontend/utils"
import { TokenStandards } from "@nfid/integration/token/types"

export const PRINCIPAL_LENGTH = 63
export const IC_ADDRESS_LENGTH = 64
export const CANISTER_ID_LENGTH = 27
export const MAX_DECIMAL_USD_LENGTH = 2

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
  (balance = "0", fee = "0") =>
  (value: string) => {
    const balanceNum = new BigNumber(balance)
    const feeNum = new BigNumber(fee)
    const valueNum = new BigNumber(value)

    if (valueNum.isNaN()) return "Invalid input"
    if (valueNum.isLessThan(0)) return "Transfer amount can't be negative value"
    if (valueNum.isGreaterThanOrEqualTo(new BigNumber("1e20")))
      return "The transferred sum cannot be excessively large."
    if (valueNum.isEqualTo(0)) return "You can't send 0"

    if (balanceNum.minus(feeNum).isLessThan(valueNum))
      return "Insufficient funds"
    return true
  }
