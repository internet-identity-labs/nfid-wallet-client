export class SwapError extends Error {
  constructor() {
    super(
      "Something went wrong with the ICPSwap service. Cancel your swap and try again.",
    )
    this.name = "SwapError"
  }
}
