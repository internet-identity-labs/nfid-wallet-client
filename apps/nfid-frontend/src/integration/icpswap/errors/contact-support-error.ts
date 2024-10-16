import { ExchangeError } from "./abstract-transaction-error"

export class ContactSupportError extends ExchangeError {
  getDisplayMessage(): string {
    return "Something went wrong with the ICPSwap service. Contact support."
  }
}
