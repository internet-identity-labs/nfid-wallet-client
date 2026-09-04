import { AccountResponse } from "../../_ic_api/identity_manager.d"
import { DeletionMode } from "../enum/deletion-mode.enum"

export interface Plan {
  steps: DeletionMode[]
  isCompleted: boolean
  account: AccountResponse
}
