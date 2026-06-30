import { DeleteAccountService } from "./dto/delete-account-service.dto"
import { DeletionStepService } from "./dto/deletion-step-service.dto"
import { Plan } from "./dto/plan.dto"
import { DeletionMode } from "./enum/deletion-mode.enum"
import { DeletionError } from "./error/deletion.error"
import { EmailAlreadyDeletedError } from "./error/email-already-deleted.error"
import { im, userRegistry } from "../actors"
import { defaultDeletionService } from "./service/default-deletion.service"
import { emailDeletionService } from "./service/email-deletion.service"
import { passkeyDeletionService } from "./service/passkey-deletion.service"
import { recoveryPhraseDeletionService } from "./service/recovery-phrase-deletion.service"

export * from "./dto/delete-account-service.dto"
export * from "./dto/deletion-step-service.dto"
export * from "./dto/plan.dto"
export * from "./enum/deletion-mode.enum"
export * from "./error/deletion.error"
export * from "./error/email-already-deleted.error"
export * from "./error/incorrect-code.error"
export * from "./error/incorrect-seed-phrase.error"
export * from "./error/passkey-not-confirmed.error"
export * from "./service/default-deletion.service"
export * from "./service/email-deletion.service"
export * from "./service/passkey-deletion.service"
export * from "./service/recovery-phrase-deletion.service"

const stepServices = new Map<DeletionMode, DeletionStepService>([
  [DeletionMode.DEFAULT, defaultDeletionService],
  [DeletionMode.PASSKEY, passkeyDeletionService],
  [DeletionMode.RECOVERY_PHRASE, recoveryPhraseDeletionService],
  [DeletionMode.EMAIL, emailDeletionService],
])

export const deleteAccountService: DeleteAccountService = {
  async getPlan(): Promise<Plan> {
    try {
      const { data } = await im.get_account()
      const account = data[0]!
      const steps: DeletionMode[] = []

      if (await passkeyDeletionService.isApplicable(account)) {
        steps.push(DeletionMode.PASSKEY)
      } else if (await recoveryPhraseDeletionService.isApplicable(account)) {
        steps.push(DeletionMode.RECOVERY_PHRASE)
      }

      if (await emailDeletionService.isApplicable(account)) {
        steps.push(DeletionMode.EMAIL)
      }

      return {
        steps: steps.length ? steps : [DeletionMode.DEFAULT],
        isCompleted: false,
        account,
      }
    } catch (error) {
      if (error instanceof DeletionError) throw error
      throw new DeletionError(
        DeletionMode.DEFAULT,
        false,
        (error as Error).message,
      )
    }
  },

  async prepareStep(plan: Plan): Promise<Plan> {
    try {
      const currentStep = plan.steps[0]
      const service = stepServices.get(currentStep)
      if (!service)
        throw new DeletionError(currentStep, false, "Something went wrong.")
      await service.prepare(plan)
      return plan
    } catch (error) {
      if (error instanceof EmailAlreadyDeletedError)
        return finalizeDeletion(plan)
      if (error instanceof DeletionError) throw error
      throw new DeletionError(plan.steps[0], false, (error as Error).message)
    }
  },

  async executeStep(plan: Plan, value: string): Promise<Plan> {
    try {
      const currentStep = plan.steps[0]
      const service = stepServices.get(currentStep)
      if (!service)
        throw new DeletionError(currentStep, false, "Something went wrong.")

      await service.execute(value, plan)

      const remainingSteps = plan.steps.slice(1)
      if (!remainingSteps.length) return finalizeDeletion(plan)

      return { ...plan, steps: remainingSteps }
    } catch (error) {
      if (error instanceof DeletionError) throw error
      throw new DeletionError(plan.steps[0], false, (error as Error).message)
    }
  },
}

async function finalizeDeletion(plan: Plan): Promise<Plan> {
  try {
    await userRegistry.address_book_delete_all()
    const { status_code } = await im.remove_account()
    if (status_code !== 200)
      throw new DeletionError(
        plan.steps[0],
        false,
        "Failed to remove account. Please, try again later.",
      )
    return { ...plan, steps: [], isCompleted: true }
  } catch (error) {
    if (error instanceof DeletionError) throw error
    throw new DeletionError(plan.steps[0], false, (error as Error).message)
  }
}
