import { DeletionMode } from "../enum/deletion-mode.enum"
import { DeletionError } from "./deletion.error"

export class PasskeyNotConfirmedError extends DeletionError {
  constructor(message?: string) {
    super(DeletionMode.PASSKEY, true, message ?? "Passkey confirmation failed")
  }
}
