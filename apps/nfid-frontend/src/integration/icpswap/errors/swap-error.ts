import { ExchangeError } from "./abstract-transaction-error"
import { SWAP_ERROR } from "./contsants"

export class SwapError extends ExchangeError {
  getDisplayMessage(): string {
    return SWAP_ERROR
  }

  constructor(e: Error | string) {
    super(e instanceof Error ? e.message : e)
  }
}
