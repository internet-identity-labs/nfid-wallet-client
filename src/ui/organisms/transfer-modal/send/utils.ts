import { Principal } from "@dfinity/principal"

import { isHex } from "frontend/ui/utils"

export const validateAddressField = (string: string) => {
  if (!string.length) return "This field cannot be empty"
  let value = string.replace(/\s/g, "")
  if (isHex(value) && value.length === 64) return true

  try {
    if (!!Principal.fromText(value) && value.length === 63) return true
  } catch {
    return "Incorrect account or principal ID"
  }
}

export const validateTransferAmountField = (value: string | number) => {
  if (Number(value) < 0) return "Transfer amount can't be negative value"
  if (Number(value) === 0) return "You can't send 0 ICP"
  return true
}
