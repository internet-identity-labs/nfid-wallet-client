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

export const accountAtom = atomWithStorage<LocalAccount | undefined>(
  ACCOUNT_LOCAL_STORAGE_KEY,
  undefined,
)
export const userNumberAtom = atom((get) => {
  const account = get(accountAtom)
  return getUserNumber(account ? account.anchor : null)
})
