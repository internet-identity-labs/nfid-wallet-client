import { SLIPPAGE_QUOTE_ERROR } from "./contsants"

export class SlippageQuoteError extends Error {
  constructor() {
    super(SLIPPAGE_QUOTE_ERROR)
    this.name = "SlippageQuoteError"
  }
}
