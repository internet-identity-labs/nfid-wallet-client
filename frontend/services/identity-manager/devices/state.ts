import { atom } from "jotai"

// TODO: update to backend api
export interface Device {
  alias: string
  pubkey: number[]
}

export const devicesAtom = atom<Device[]>([])
