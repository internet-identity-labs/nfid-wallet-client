export abstract class TransactionError extends Error {
  private errorMessage: string
  constructor(errorMessage: any) {
    super()
    this.errorMessage = errorMessage
  }

  getErrorMessage() {
    return this.errorMessage
  }

  abstract getDisplayMessage(): string
}
