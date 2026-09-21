export class RememberMeError extends Error {
  constructor(message?: string) {
    super(message ?? "Remember-me operation failed")
  }
}
