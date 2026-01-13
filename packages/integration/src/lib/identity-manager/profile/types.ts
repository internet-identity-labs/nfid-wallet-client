import { AccessPoint } from "../access-points"
import { Account } from "../account"

import { RootWallet } from "./constants"

export interface Profile {
  name?: string
  anchor: number
  accessPoints: AccessPoint[]
  accounts: Account[]
  principalId: string
  phoneNumber?: string
  wallet: RootWallet
  is2fa: boolean
  email?: string
}
