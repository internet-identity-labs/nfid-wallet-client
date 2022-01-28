import { getUserNumber } from "frontend/services/internet-identity/userNumber"
import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { AccountResponse } from "../identity_manager"
import { ACCOUNT_LOCAL_STORAGE_KEY } from "./constants"

export interface LocalAccount extends Omit<AccountResponse, "anchor"> {
  anchor: string
  iiAnchors?: string[]
}

export const accountAtom = atomWithStorage<LocalAccount | undefined>(
  ACCOUNT_LOCAL_STORAGE_KEY,
  undefined,
)
export const userNumberAtom = atom((get) => {
  const account = get(accountAtom)
  return getUserNumber(account ? account.anchor : null)
})
