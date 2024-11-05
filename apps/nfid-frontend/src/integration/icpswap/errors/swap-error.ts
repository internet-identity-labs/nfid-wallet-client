import { ExchangeError } from "./abstract-transaction-error"

export class SwapError extends ExchangeError {
  constructor() {
    super(
      "Something went wrong with the ICPSwap service. Cancel your swap and try again.",
    )
  }
}
