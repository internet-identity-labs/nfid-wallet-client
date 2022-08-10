import { atom } from "jotai"

import { Challenge } from "frontend/integration/_ic_api/internet_identity_types"

export const challengeAtom = atom<Challenge | undefined>(undefined)
