import { ExchangeError } from "./abstract-transaction-error"
import { SLIPPAGE_SWAP_ERROR } from "./constants"

export class SlippageSwapError extends ExchangeError {
  getDisplayMessage(): string {
    return SLIPPAGE_SWAP_ERROR
  }

  constructor(e: Error | string) {
    super(e instanceof Error ? e.message : e)
  }
}
