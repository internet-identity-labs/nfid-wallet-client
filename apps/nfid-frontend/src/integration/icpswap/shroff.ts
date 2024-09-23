import { Quote } from "src/integration/icpswap/quote"

export interface Shroff {
  getQuote(amount: number): Promise<Quote>
}
