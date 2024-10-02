export class LiquidityError extends Error {
  constructor() {
    super("Provider doesn’t have enough liquidity to complete this swap.")
    this.name = "LiquidityError"
  }
}
