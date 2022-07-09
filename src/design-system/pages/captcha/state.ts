import { atom } from "jotai"

import { Challenge } from "frontend/comm/idl/internet_identity_types"

export const challengeAtom = atom<Challenge | undefined>(undefined)
