import { TransactionError } from "./abstract-transaction-error"

export class SwapError extends TransactionError {
  getDisplayMessage(): string {
    return "Something went wrong with the ICPSwap service. Cancel your swap and try again."
  }
}
