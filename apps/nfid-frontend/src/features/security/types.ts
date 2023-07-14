import { PublicKey } from "@dfinity/agent"

import { DeviceType, Icon } from "@nfid/integration"

import { DeviceKey } from "frontend/integration/_ic_api/internet_identity.d"

export interface IDevice {
  type: DeviceType
  label: string
  icon: Icon
  created_at: string
  last_used: string
  isMultiDevice: boolean
  isLegacyDevice: boolean
  principal: string
}

export interface IGroupedDevices {
  passkeys: IDevice[]
  emailDevice?: IDevice
  recoveryDevice?: IDevice
}
