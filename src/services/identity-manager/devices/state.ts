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
  label: string
  icon: Icon
  pubkey: number[]
}

export const devicesAtom = atom<Device[]>([])
