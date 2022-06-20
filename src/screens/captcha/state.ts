import { atom } from "jotai"

import { Challenge } from "frontend/api/idl/internet_identity_types"

export const challengeAtom = atom<Challenge | undefined>(undefined)
