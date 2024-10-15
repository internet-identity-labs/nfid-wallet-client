import { ExchangeError } from "./abstract-transaction-error"

export class SwapError extends ExchangeError {
  getDisplayMessage(): string {
    return "Something went wrong with the ICPSwap service. Cancel your swap and try again."
  }
}
