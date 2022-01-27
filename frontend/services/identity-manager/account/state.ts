import { getUserNumber } from "frontend/services/internet-identity/userNumber"
import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { AccountResponse } from "../identity_manager"
import { ACCOUNT_LOCAL_STORAGE_KEY } from "./constants"

export type LocalAccount = AccountResponse & { rootAnchor: string }

export const accountAtom = atomWithStorage<LocalAccount | undefined>(
  ACCOUNT_LOCAL_STORAGE_KEY,
  undefined,
)
export const userNumberAtom = atom((get) => {
  const account = get(accountAtom)
  return getUserNumber(account ? account.rootAnchor : null)
})
