import { ExchangeError } from "./abstract-transaction-error"

export class DepositError extends ExchangeError {
  getDisplayMessage(): string {
    return "Something went wrong with the ICPSwap service. Cancel your swap and try again."
  }
}
