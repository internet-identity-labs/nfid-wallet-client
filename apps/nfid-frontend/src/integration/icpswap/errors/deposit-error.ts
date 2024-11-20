import { ExchangeError } from "./abstract-transaction-error"
import { DEPOSIT_ERROR } from "./contsants"

export class DepositError extends ExchangeError {
  getDisplayMessage(): string {
    return DEPOSIT_ERROR
  }

  constructor(e: Error | string) {
    super(e instanceof Error ? e.message : e)
  }
}
