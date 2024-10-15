import { ExchangeError } from "./abstract-transaction-error"

export class WithdrawError extends ExchangeError {
  constructor() {
    super("Something went wrong with the ICPSwap service. Complete your swap.")
  }
}
