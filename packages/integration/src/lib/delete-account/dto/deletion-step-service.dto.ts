import { AccountResponse } from "../../_ic_api/identity_manager.d"
import { Plan } from "./plan.dto"

export interface DeletionStepService {
  isApplicable(account: AccountResponse): Promise<boolean>
  prepare(plan: Plan): Promise<void>
  execute(value: string, plan: Plan): Promise<void>
}
