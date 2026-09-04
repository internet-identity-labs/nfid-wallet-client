import { Plan } from "./plan.dto"

export type DeleteAccountService = {
  getPlan(): Promise<Plan>
  prepareStep(plan: Plan): Promise<Plan>
  executeStep(plan: Plan, value: string): Promise<Plan>
}
