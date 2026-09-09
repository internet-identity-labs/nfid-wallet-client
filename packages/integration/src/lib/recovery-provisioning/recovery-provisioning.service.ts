import { im } from "../actors"
import { RecoveryProvisioningPlan } from "./dto/recovery-provisioning-plan.dto"
import { RecoveryProvisioningMode } from "./enum/recovery-provisioning-mode.enum"
import { RecoveryProvisioningError } from "./error/recovery-provisioning.error"
import { deviceTypeMapper } from "./lib/device-type.mapper"
import { passkeyRecoveryProvisioningStepService } from "./service/passkey-recovery-provisioning-step-service"
import { recoveryPhraseRecoveryProvisioningStepService } from "./service/recovery-phrase-recovery-provisioning-step-service"
import { RecoveryProvisioningStepService } from "./service/recovery-provisioning-step-service"

export * from "./dto/recovery-provisioning-plan.dto"
export * from "./enum/recovery-provisioning-mode.enum"
export * from "./error/recovery-provisioning.error"
export * from "./service/passkey-recovery-provisioning-step-service"
export * from "./service/recovery-phrase-recovery-provisioning-step-service"
export * from "./service/recovery-provisioning-step-service"

export interface RecoveryProvisioningService {
  getPlan(): Promise<RecoveryProvisioningPlan>
  checkAccount(
    plan: RecoveryProvisioningPlan,
  ): Promise<RecoveryProvisioningPlan>
}

const stepServices = new Map<
  RecoveryProvisioningMode,
  RecoveryProvisioningStepService
>([
  [RecoveryProvisioningMode.PASSKEY, passkeyRecoveryProvisioningStepService],
  [
    RecoveryProvisioningMode.RECOVERY_PHRASE,
    recoveryPhraseRecoveryProvisioningStepService,
  ],
])

export const recoveryProvisioningService: RecoveryProvisioningService = {
  async getPlan(): Promise<RecoveryProvisioningPlan> {
    try {
      const { data } = await im.get_account()
      const account = data[0]
      if (!account)
        throw new RecoveryProvisioningError(
          "No account returned to evaluate recovery devices",
        )

      const deviceTypes = deviceTypeMapper.toDeviceTypes(account.access_points)

      for (const [mode, service] of stepServices) {
        if (
          (await service.supportsMode()) &&
          !service.isRegistered(deviceTypes)
        )
          return { steps: [mode], isCompleted: false }
      }

      return { steps: [], isCompleted: true }
    } catch (error) {
      if (error instanceof RecoveryProvisioningError) throw error
      console.error("recoveryProvisioningService.getPlan", { error })
      throw new RecoveryProvisioningError((error as Error).message)
    }
  },

  async checkAccount(
    plan: RecoveryProvisioningPlan,
  ): Promise<RecoveryProvisioningPlan> {
    if (!plan.steps.length || plan.isCompleted) return plan

    try {
      const currentMode = plan.steps[0]
      const service = stepServices.get(currentMode)
      if (!service) throw new RecoveryProvisioningError("Unknown recovery mode")

      const { data } = await im.get_account()
      const deviceTypes = deviceTypeMapper.toDeviceTypes(
        data[0]?.access_points ?? [],
      )

      if (service.isRegistered(deviceTypes))
        return { ...plan, steps: [], isCompleted: true }

      throw new RecoveryProvisioningError()
    } catch (error) {
      if (error instanceof RecoveryProvisioningError) throw error
      console.error("recoveryProvisioningService.checkAccount", { error })
      throw new RecoveryProvisioningError((error as Error).message)
    }
  },
}
