import { DeletionMode } from "../enum/deletion-mode.enum"
import { DeletionError } from "./deletion.error"

export class IncorrectSeedPhraseError extends DeletionError {
  constructor(message?: string) {
    super(
      DeletionMode.RECOVERY_PHRASE,
      false,
      message ?? "Invalid recovery phrase",
    )
  }
}
