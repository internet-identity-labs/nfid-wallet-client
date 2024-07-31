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
    return this.getDate().toISOString()
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
