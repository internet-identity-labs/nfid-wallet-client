export class WithdrawError extends Error {
  constructor() {
    super("Something went wrong with the ICPSwap service. Complete your swap.")
    this.name = "WithdrawError"
  }
}
