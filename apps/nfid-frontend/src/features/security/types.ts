import { DeviceType, Icon } from "@nfid/integration"

import { PublicKey } from "frontend/integration/_ic_api/internet_identity.d"

export interface IDevice {
  type: DeviceType
  label: string
  origin?: string
  icon: Icon
  created_at: string
  last_used: string
  isMultiDevice: boolean
  isLegacyDevice: boolean
  principal: string
  credentialId: string
  credentialIdBuffer?: Array<number>
  publickey?: PublicKey
}

export interface IGroupedDevices {
  passkeys: IDevice[]
  emailDevice?: IDevice
  recoveryDevice?: IDevice
}
