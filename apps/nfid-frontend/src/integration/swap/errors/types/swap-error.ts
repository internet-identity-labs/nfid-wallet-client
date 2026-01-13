import { SwapName } from "../../types/enums"

import { ExchangeError } from "./abstract-transaction-error"
import { getSwapError } from "./constants"

export class SwapError extends ExchangeError {
  getDisplayMessage(provider: SwapName): string {
    return getSwapError(provider)
  }

  constructor(e: Error | string) {
    super(e instanceof Error ? e.message : e)
  }
}
