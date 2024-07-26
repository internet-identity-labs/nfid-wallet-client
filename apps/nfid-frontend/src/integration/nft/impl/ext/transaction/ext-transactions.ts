import {TransactionPrettified} from "@psychedelic/cap-js"
import {
  SellTransactionRecord,
  TransactionRecordView, TransferTransactionRecord,
} from "src/integration/nft/impl/nft-transaction-record"
import {formatPrice} from "src/integration/nft/util/util";

export class SaleTransactionRecordExt implements SellTransactionRecord {
  private readonly from: string
  private readonly to: string
  private readonly price: bigint
  private readonly date: Date
  private readonly priceDecimals: bigint
  private readonly priceCurrency: string

  constructor(rawTransaction: TransactionPrettified) {
    if (rawTransaction.operation.toLowerCase() !== "sale") {
      throw new Error("Invalid transaction type")
    }
    this.from = rawTransaction.from!
    this.to = rawTransaction.to!
    this.price = rawTransaction.details.price as bigint
    //I can't even imagine why it's different from the other one
    this.date = new Date(Number(rawTransaction.time / BigInt(1000000)))
    this.priceDecimals = rawTransaction.details.price_decimals as bigint
    this.priceCurrency = rawTransaction.details.price_currency as string
  }

  getTransactionView(): TransactionRecordView {
    return {
      type: "Sale",
      date: this.date.toISOString(),
      from: this.from,
      to: this.to,
      price: formatPrice(this.price, this.priceDecimals, this.priceCurrency)
    }
  }
}

export class TransferTransactionRecordExt implements TransferTransactionRecord {
  private readonly from: string
  private readonly to: string
  private readonly date: Date

  constructor(rawTransaction: TransactionPrettified) {
    if (rawTransaction.operation.toLowerCase() !== "transfer") {
      throw new Error(
        "Expect transfer but got invalid transaction type: " +
        rawTransaction.operation,
      )
    }
    this.from = rawTransaction.from!
    this.to = rawTransaction.to!
    // ¯\_(ツ)_/¯  see tests
    this.date = new Date(Number(rawTransaction.time))
  }

  getTransactionView(): TransactionRecordView {
    return {
      type: "Transfer",
      date: this.date.toISOString(),
      from: this.from,
      to: this.to,
      price: undefined
    }
  }

}
