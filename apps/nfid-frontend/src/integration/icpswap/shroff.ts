import { SignIdentity } from "@dfinity/agent"
import { Quote } from "src/integration/icpswap/quote"
import { SwapTransaction } from "src/integration/icpswap/swap-transaction"

export interface Shroff {
  getTargets(): string[]
  getQuote(amount: number): Promise<Quote>
  swap(delegationIdentity: SignIdentity): Promise<SwapTransaction>
  getSwapTransaction(): SwapTransaction | undefined
  validateQuote(): Promise<Quote>
}
