import { SwapName } from "../../types/enums"

import { ExchangeError } from "./abstract-transaction-error"
import { getDepositError } from "./constants"

export class DepositError extends ExchangeError {
  getDisplayMessage(provider: SwapName): string {
    return getDepositError(provider)
  }

  constructor(e: Error | string) {
    super(e instanceof Error ? e.message : e)
  }
}
