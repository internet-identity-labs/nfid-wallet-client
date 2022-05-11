import { atom } from "jotai"

import { Challenge } from "frontend/services/internet-identity/generated/internet_identity_types"

export const captchaStateAtom = atom<Challenge | undefined>(undefined)
