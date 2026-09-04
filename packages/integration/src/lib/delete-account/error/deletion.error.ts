import { DeletionMode } from "../enum/deletion-mode.enum"

export class DeletionError extends Error {
  constructor(
    public readonly deletionMode: DeletionMode,
    public readonly retriable: boolean,
    message?: string,
  ) {
    super(message ?? "Account deletion failed")
  }
}
