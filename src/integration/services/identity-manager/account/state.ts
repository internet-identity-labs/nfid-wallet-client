import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

import { AccountResponse } from "frontend/integration/idl/identity_manager.did"
import { getUserNumber } from "frontend/integration/services/internet-identity/userNumber"

import { ACCOUNT_LOCAL_STORAGE_KEY } from "./constants"

export interface LocalAccount
  extends Omit<
    AccountResponse,
    | "anchor"
    | "name"
    | "personas"
    | "phone_number"
    | "principal_id"
    | "access_points"
  > {
  anchor: string
  name?: string
  iiAnchors?: string[]

  // temporary front-end hack to skip personalization process
  skipPersonalize?: boolean
  phoneNumber?: string
}

export const localStorageAccountAtom = atomWithStorage<
  LocalAccount | undefined
>(ACCOUNT_LOCAL_STORAGE_KEY, undefined)

export const memoryAccountAtom = atom<LocalAccount | undefined>(undefined)

export const userNumberAtom = atom((get) => {
  const localStorageAccount = get(localStorageAccountAtom)
  const memoryAccount = get(memoryAccountAtom)
  const account = localStorageAccount || memoryAccount
  return getUserNumber(account ? account.anchor : null)
})
