import { TransactionError } from "./abstract-transaction-error"

export class WithdrawError extends TransactionError {
  getDisplayMessage(): string {
    return "Something went wrong with the ICPSwap service. Complete your swap."
  }
}
