import { AccessPoint } from "./access-points"
import { Account } from "./account"

export interface Profile {
  name?: string
  anchor: number
  accessPoints: AccessPoint[]
  accounts: Account[]
  principalId: string
  phoneNumber?: string
  wallet: RootWallet
  is2fa: boolean
}

export enum RootWallet {
  NFID = "NFID",
  II = "II",
}
