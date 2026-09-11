import { AccountResponse } from "../../_ic_api/identity_manager.d"
import { reauthenticationService } from "../../authentication/reauthentication.service"
import { DeletionStepService } from "../dto/deletion-step-service.dto"
import { Plan } from "../dto/plan.dto"
import { PasskeyNotConfirmedError } from "../error/passkey-not-confirmed.error"
import { DeletionError } from "../error/deletion.error"
import { DeletionMode } from "../enum/deletion-mode.enum"

export const passkeyDeletionService: DeletionStepService = {
  async isApplicable(account: AccountResponse): Promise<boolean> {
    return account.is2fa_enabled ?? false
  },

  async prepare(plan: Plan): Promise<void> {
    try {
      await reauthenticationService.reauthenticateWithPasskey(
        plan.account.access_points,
      )
    } catch (error) {
      if (error instanceof PasskeyNotConfirmedError) throw error
      if (error instanceof DeletionError) throw error
      throw new DeletionError(
        DeletionMode.PASSKEY,
        false,
        (error as Error).message,
      )
    }
  },

  async execute(): Promise<void> {},
}
