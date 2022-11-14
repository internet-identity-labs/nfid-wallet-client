import { atom } from "jotai"

export type Icon =
  | "mobile"
  | "tablet"
  | "desktop"
  | "laptop"
  | "document"
  | "usb"
  | "google"
  | "unknown"

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
