import { ExchangeError } from "./abstract-transaction-error"
import { WITHDRAW_ERROR } from "./contsants"

export class WithdrawError extends ExchangeError {
  getDisplayMessage(): string {
    return WITHDRAW_ERROR
  }

  constructor(e: Error | string) {
    super(e instanceof Error ? e.message : e)
  }
}
