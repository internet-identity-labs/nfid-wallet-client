import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

import { getUserNumber } from "frontend/services/internet-identity/userNumber"

import { AccountResponse } from "../identity_manager.did"
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
}

export const accountRegisteredAtom = atomWithStorage<LocalAccount | undefined>(
  ACCOUNT_LOCAL_STORAGE_KEY,
  undefined,
)

export const accountRecoveryAtom = atom<LocalAccount | undefined>(undefined)

export const userNumberAtom = atom((get) => {
  const registeredAccount = get(accountRegisteredAtom)
  const recoveryAccount = get(accountRecoveryAtom)
  const account = registeredAccount || recoveryAccount
  return getUserNumber(account ? account.anchor : null)
})
