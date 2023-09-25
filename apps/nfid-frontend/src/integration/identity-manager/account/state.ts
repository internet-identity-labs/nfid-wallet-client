import { atom } from "jotai"

import { Profile } from "@nfid/integration"

import { getUserNumber } from "frontend/integration/internet-identity/userNumber"

export const memoryAccountAtom = atom<Profile | undefined>(undefined)

export const userNumberAtom = atom((get) => {
  const account = get(memoryAccountAtom)
  return getUserNumber(account ? account.anchor : null)
})
