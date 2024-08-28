import { format } from "date-fns"
import { TransactionRecord } from "src/integration/nft/nft"

export abstract class TransactionRecordAbstract implements TransactionRecord {
  abstract getTransactionView(): TransactionRecordView
}

export class TransactionRecordView {
  private readonly date: Date
  private readonly type: string
  private readonly from: string | undefined
  private readonly to: string | undefined
  private readonly priceFormatted: string | undefined

  constructor(
    type: string,
    from: string | undefined,
    to: string | undefined,
    price: string | undefined,
    date: Date,
  ) {
    this.type = type
    this.from = from
    this.to = to
    this.priceFormatted = price
    this.date = date
  }

  getType(): string {
    return this.type
  }

  getFrom(): string | undefined {
    return this.from
  }

  getTo(): string | undefined {
    return this.to
  }

  getFormattedDate(): string {
    let date
    const timestamp = this.getDate().getTime()
    const length = timestamp.toString().length
    // seems like API can return timestamp in different format
    // I am not sure that it's a good solution:
    switch (true) {
      case length > 10:
        date = new Date(timestamp)
        break
      case length === 10:
        date = new Date(timestamp * 1000)
        break
      case length < 10:
        date = new Date(timestamp * 1000000)
        break
      default:
        date = new Date(timestamp)
        break
    }

    return format(date, "MMM dd, yyyy - hh:mm:ss a").replace(
      /AM|PM/g,
      (match) => match.toLowerCase(),
    )
  }

  getFormattedPrice(): string | undefined {
    return this.priceFormatted
  }

  private getDate(): Date {
    return this.date
  }
}

export interface TransferTransactionRecord extends TransactionRecordAbstract {}

export interface SellTransactionRecord extends TransactionRecordAbstract {}

export interface MintTransactionRecord extends TransactionRecordAbstract {}

export interface BurnTransactionRecord extends TransactionRecordAbstract {}

export interface ListTransactionRecord extends TransactionRecordAbstract {}

export interface ClaimTransactionRecord extends TransactionRecordAbstract {}
