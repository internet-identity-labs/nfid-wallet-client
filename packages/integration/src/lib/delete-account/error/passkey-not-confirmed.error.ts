import { DeletionMode } from "../enum/deletion-mode.enum"
import { DeletionError } from "./deletion.error"

export class PasskeyNotConfirmedError extends DeletionError {
  constructor(message?: string) {
    super(DeletionMode.PASSKEY, false, message ?? "Passkey confirmation failed")
  }
}
