import {
  SellTransactionRecord,
  TransactionRecordView,
} from "src/integration/nft/impl/nft-transaction-record"
import { TransactionToniq } from "src/integration/nft/impl/ext/transaction/types"
import { formatPrice } from "src/integration/nft/util/util"

export class TransactionRecordToniq implements SellTransactionRecord {
  private readonly from: string
  private readonly to: string
  private readonly price: bigint
  private readonly date: Date
  private readonly priceDecimals: bigint
  private readonly priceCurrency: string

  constructor(rawTransaction: TransactionToniq) {
    this.from = rawTransaction.seller!
    this.to = rawTransaction.buyer!
    this.price = BigInt(rawTransaction.price)
    this.date = new Date(rawTransaction.time / 1000000)
    this.priceDecimals = BigInt(8)
    this.priceCurrency = "ICP"
  }

  getTransactionView(): TransactionRecordView {
    const a = new TransactionRecordView(
      "Sale",
      this.from,
      this.to,
      formatPrice(this.price, this.priceDecimals, this.priceCurrency),
      this.date,
    )
    return a
  }
}
