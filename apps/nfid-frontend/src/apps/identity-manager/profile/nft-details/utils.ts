import { TransactionPrettified } from "@psychedelic/cap-js"
import { format } from "date-fns"

export interface ITransaction {
  from: string
  to: string
  datetime: string
  type: string
  price?: string
}

export const mapTransactionsForUI = (transactions: TransactionPrettified[]) => {
  return transactions.map((transaction) => {
    const details = transaction.details
    return {
      type: transaction.operation,
      datetime: format(
        new Date(Number(transaction.time)),
        "MMM dd, yyyy - hh:mm:ss aaa",
      ),
      from: transaction.from || "",
      to: transaction.to || "",
      price:
        details?.price && details?.price_currency && details?.price_decimals
          ? `${Number(details.price) / 10 ** Number(details.price_decimals)} ${
              details.price_currency
            }`
          : "",
    }
  })
}
