import { ExchangeError } from "./abstract-transaction-error"

export class WithdrawError extends ExchangeError {
  getDisplayMessage(): string {
    return "Something went wrong with the ICPSwap service. Complete your swap."
  }
}
