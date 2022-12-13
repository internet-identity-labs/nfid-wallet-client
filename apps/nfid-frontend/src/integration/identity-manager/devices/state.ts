import { atom } from "jotai"

import { Icon } from "@nfid/integration"

export interface AccessPointRequest {
  icon: string
  device: string
  pub_key: Array<number>
  browser: string
}

// TODO: update to backend api
/**
 * @deprecated
 */
export interface LegacyDevice {
  isAccessPoint?: boolean // Indicates if this device is already stored as access point
  isSocialDevice?: boolean // Indicates if this device is social method
  isWalletDevice?: boolean // Indicates if this II device
  isSecurityKey?: boolean
  label: string
  icon: Icon
  browser: string
  lastUsed: number
  pubkey: number[]
}

export interface RecoveryDevice {
  icon: Icon
  isAccessPoint?: boolean // Indicates if this device is already stored as access point
  label: string
  lastUsed: number
  pubkey: number[]
  isRecoveryPhrase: boolean
  isSecurityKey: boolean
  isProtected?: boolean
}

export const devicesAtom = atom<LegacyDevice[]>([])
export const recoveryDevicesAtom = atom<RecoveryDevice[]>([])
