import { DeletionMode } from "../enum/deletion-mode.enum"
import { DeletionError } from "./deletion.error"

export class IncorrectCodeError extends DeletionError {
  constructor(message?: string) {
    super(DeletionMode.EMAIL, true, message ?? "Invalid deletion code")
  }
}
