import { SignIdentity } from "@dfinity/agent"
import { Quote } from "src/integration/swap/quote"
import { SwapTransaction } from "src/integration/swap/swap-transaction"
import { SwapName } from "src/integration/swap/types/enums"

import { FT } from "../ft/ft"

export interface Shroff {
  getSwapName(): SwapName
  setQuote(quote: Quote): void
  getQuote(amount: string): Promise<Quote>
  swap(delegationIdentity: SignIdentity): Promise<SwapTransaction>
  getSwapTransaction(): SwapTransaction | undefined
  setTransaction(transaction: SwapTransaction): void
}
