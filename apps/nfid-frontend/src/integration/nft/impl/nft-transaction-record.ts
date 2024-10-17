import { format } from "date-fns"
import { TransactionRecord } from "src/integration/nft/nft"

import { exchangeRateService } from "@nfid/integration"

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
    const timestamp = this.getDate().getTime()
    const date = new Date(timestamp)
    return format(date, "MMM dd, yyyy - hh:mm:ss a").replace(
      /AM|PM/g,
      (match) => match.toLowerCase(),
    )
  }

  getFormattedPrice(): string | undefined {
    return this.priceFormatted
  }

  getFormattedUsdPrice(): string | undefined {
    if (!this.priceFormatted) return
    const rawPrice = parseFloat(this.priceFormatted)
    return `${(exchangeRateService.getICP2USD().toNumber() * rawPrice).toFixed(
      2,
    )} USD`
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
