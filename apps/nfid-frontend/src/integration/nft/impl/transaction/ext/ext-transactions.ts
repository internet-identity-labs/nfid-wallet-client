import { TransactionPrettified } from "@psychedelic/cap-js"
import { TransactionType } from "src/integration/nft/enum/enums"
import {
  SellTransactionRecordI,
  TransferTransactionRecordI,
} from "src/integration/nft/impl/transaction/nft-transaction-record"

export class SaleTransactionRecord implements SellTransactionRecordI {
  private readonly from: string
  private readonly to: string
  private readonly price: bigint
  private readonly date: Date

  constructor(rawTransaction: TransactionPrettified) {
    if (rawTransaction.operation.toLowerCase() !== "sale") {
      throw new Error("Invalid transaction type")
    }
    this.from = rawTransaction.from!
    this.to = rawTransaction.to!
    this.price = rawTransaction.details.price as bigint
    //I can't even imagine why it's different from the other one
    this.date = new Date(Number(rawTransaction.time / BigInt(1000000)))
  }

  getFrom(): string {
    return this.from
  }

  getTo(): string {
    return this.to
  }

  getPrice(): bigint {
    return this.price
  }

  getType(): TransactionType {
    return TransactionType.SALE
  }

  getDate(): Date {
    return this.date
  }
}

export class TransferTransactionRecord implements TransferTransactionRecordI {
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

  getFrom(): string {
    return this.from
  }

  getTo(): string {
    return this.to
  }

  getType(): TransactionType {
    return TransactionType.TRANSFER
  }

  getDate(): Date {
    return this.date
  }
}
