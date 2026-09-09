import { RecoveryProvisioningMode } from "../enum/recovery-provisioning-mode.enum"

export interface RecoveryProvisioningPlan {
  steps: RecoveryProvisioningMode[]
  isCompleted: boolean
}
