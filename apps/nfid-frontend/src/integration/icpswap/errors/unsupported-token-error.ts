export class UnsupportedTokenError extends Error {
  constructor() {
    super(
      "Provider doesn't have enough liquidity to complete this swap. Lower the swap amount and try again.",
    )
    this.name = "UnsupportedTokenError"
  }
}
