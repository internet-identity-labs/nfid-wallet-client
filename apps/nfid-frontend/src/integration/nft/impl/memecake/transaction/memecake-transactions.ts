import { Transaction } from "src/integration/nft/impl/memecake/transaction/transaction-types"
import {
  SellTransactionRecord,
  TransactionRecordView,
} from "src/integration/nft/impl/nft-transaction-record"

export class SoldTransactionRecordMemeCake implements SellTransactionRecord {
  private readonly from: string
  private readonly to: string
  private readonly date: Date
  private readonly price: string

  constructor(rawTransaction: Transaction) {
    if (rawTransaction.transctionType.toLowerCase() !== "buy") {
      throw new Error("Invalid transaction type")
    }
    //principals
    this.from = rawTransaction.sellerPubKey
    this.to = rawTransaction.buyerPubKey
    this.date = new Date(rawTransaction.transactionDate)
    this.price = rawTransaction.transactionAmount + " ICP"
  }

  getTransactionView(): TransactionRecordView {
    return {
      type: "Sale",
      date: this.date.toISOString(),
      from: this.from,
      to: this.to,
      price: this.price,
    }
  }
}
