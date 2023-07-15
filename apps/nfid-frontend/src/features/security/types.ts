import { DeviceType, Icon } from "@nfid/integration"

export interface IDevice {
  type: DeviceType
  label: string
  icon: Icon
  created_at: string
  last_used: string
  isMultiDevice: boolean
  isLegacyDevice: boolean
  principal: string
  credentialId: string
}

export interface IGroupedDevices {
  passkeys: IDevice[]
  emailDevice?: IDevice
  recoveryDevice?: IDevice
}
