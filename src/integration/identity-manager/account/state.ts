import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

import { getUserNumber } from "frontend/integration/internet-identity/userNumber"

import { Profile } from ".."
import { ACCOUNT_LOCAL_STORAGE_KEY } from "./constants"

export const localStorageAccountAtom = atomWithStorage<Profile | undefined>(
  ACCOUNT_LOCAL_STORAGE_KEY,
  undefined,
)

export const memoryAccountAtom = atom<Profile | undefined>(undefined)

export const userNumberAtom = atom((get) => {
  const localStorageAccount = get(localStorageAccountAtom)
  const memoryAccount = get(memoryAccountAtom)
  const account = localStorageAccount || memoryAccount
  return getUserNumber(account ? account.anchor : null)
})
