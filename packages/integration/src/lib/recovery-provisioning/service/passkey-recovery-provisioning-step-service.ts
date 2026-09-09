import { DeviceType } from "../../identity-manager/access-points"
import { RecoveryProvisioningStepService } from "./recovery-provisioning-step-service"

export const passkeyRecoveryProvisioningStepService: RecoveryProvisioningStepService =
  {
    async supportsMode(): Promise<boolean> {
      if (typeof window === "undefined" || !window.PublicKeyCredential) {
        return false
      }

      try {
        return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      } catch {
        return false
      }
    },

    isRegistered(deviceTypes: DeviceType[]): boolean {
      return deviceTypes.includes(DeviceType.Passkey)
    },
  }
