import { DeviceType } from "../../identity-manager/access-points"
import { RecoveryProvisioningStepService } from "./recovery-provisioning-step-service"

export const recoveryPhraseRecoveryProvisioningStepService: RecoveryProvisioningStepService =
  {
    async supportsMode(): Promise<boolean> {
      return true
    },

    isRegistered(deviceTypes: DeviceType[]): boolean {
      return deviceTypes.includes(DeviceType.Recovery)
    },
  }
