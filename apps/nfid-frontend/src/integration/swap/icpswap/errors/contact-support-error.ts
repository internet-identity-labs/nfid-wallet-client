import { ExchangeError } from "./abstract-transaction-error"
import { CONTACT_SUPPORT_ERROR } from "./constants"

export class ContactSupportError extends ExchangeError {
  getDisplayMessage(): string {
    return CONTACT_SUPPORT_ERROR
  }

  constructor(e: Error | string) {
    super(e instanceof Error ? e.message : e)
  }
}
