import { ExchangeError } from "./abstract-transaction-error"
import { SLIPPAGE_ERROR } from "./contsants"

export class SlippageSwapError extends ExchangeError {
  getDisplayMessage(): string {
    return SLIPPAGE_ERROR
  }

  constructor(e: Error | string) {
    super(e instanceof Error ? e.message : e)
  }
}
