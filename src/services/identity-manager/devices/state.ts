import { atom } from "jotai"

export type Icon = "mobile" | "tablet" | "desktop" | "laptop" | "key"

export interface AccessPointRequest {
  icon: string
  device: string
  pub_key: Array<number>
  browser: string
}

// TODO: update to backend api
export interface Device {
  isAccessPoint?: boolean // Indicates if this device is already stored as access point
  label: string
  icon: Icon
  browser: string
  pubkey: number[]
}

export const devicesAtom = atom<Device[]>([])
