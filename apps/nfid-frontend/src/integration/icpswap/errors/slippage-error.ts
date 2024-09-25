export class SlippageError extends Error {
  constructor() {
    super("Swap exceeded slippage tolerance. Try again.")
    this.name = "SlippageError"
  }
}
