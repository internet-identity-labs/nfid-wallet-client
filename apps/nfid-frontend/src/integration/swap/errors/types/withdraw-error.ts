import { SwapName } from "../../types/enums"

import { ExchangeError } from "./abstract-transaction-error"
import { getWithdrawError } from "./constants"

export class WithdrawError extends ExchangeError {
  getDisplayMessage(provider: SwapName): string {
    return getWithdrawError(provider)
  }

  constructor(e: Error | string) {
    super(e instanceof Error ? e.message : e)
  }
}
