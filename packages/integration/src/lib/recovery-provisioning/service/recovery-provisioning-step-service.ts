import { DeviceType } from "../../identity-manager/access-points"

export interface RecoveryProvisioningStepService {
  supportsMode(): Promise<boolean>
  isRegistered(deviceTypes: DeviceType[]): boolean
}
