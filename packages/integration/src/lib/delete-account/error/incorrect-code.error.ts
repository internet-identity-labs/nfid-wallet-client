import { DeletionMode } from "../enum/deletion-mode.enum"
import { DeletionError } from "./deletion.error"

export class IncorrectCodeError extends DeletionError {
  constructor(message?: string) {
    super(DeletionMode.EMAIL, false, message ?? "Invalid deletion code")
  }
}
