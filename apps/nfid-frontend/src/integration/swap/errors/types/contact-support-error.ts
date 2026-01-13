import { SwapName } from "../../types/enums"

import { ExchangeError } from "./abstract-transaction-error"
import { getContactSupportError } from "./constants"

export class ContactSupportError extends ExchangeError {
  getDisplayMessage(provider: SwapName): string {
    return getContactSupportError(provider)
  }

  constructor(e: Error | string) {
    super(e instanceof Error ? e.message : e)
  }
}
