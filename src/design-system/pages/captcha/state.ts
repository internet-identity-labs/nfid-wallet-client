import { atom } from "jotai"

import { Challenge } from "frontend/integration/idl/internet_identity_types"

export const challengeAtom = atom<Challenge | undefined>(undefined)
