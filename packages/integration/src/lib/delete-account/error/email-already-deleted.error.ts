import { DeletionMode } from "../enum/deletion-mode.enum"
import { DeletionError } from "./deletion.error"

export class EmailAlreadyDeletedError extends DeletionError {
  constructor(message?: string) {
    super(
      DeletionMode.EMAIL,
      false,
      message ?? "Email address cannot be checked",
    )
  }
}
