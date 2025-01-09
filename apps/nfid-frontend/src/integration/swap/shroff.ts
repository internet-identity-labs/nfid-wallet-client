import { SignIdentity } from "@dfinity/agent"
import { Quote } from "src/integration/swap/quote"
import { SwapTransaction } from "src/integration/swap/icpswap/swap-transaction"

export interface Shroff {
  setQuote(quote: Quote): void
  getTargets(): string[]
  getQuote(amount: string): Promise<Quote>
  swap(delegationIdentity: SignIdentity): Promise<SwapTransaction>
  getSwapTransaction(): SwapTransaction | undefined
  validateQuote(): Promise<Quote>
  setTransaction(transaction: SwapTransaction): void
}
