import { TransferRecord } from "src/integration/nft/impl/icpswap/idl/SwapNFT.d"
import {
  MintTransactionRecord,
  TransactionRecordView,
  TransferTransactionRecord,
} from "src/integration/nft/impl/nft-transaction-record"

export class TransferTransactionRecordIcpSwap implements TransferTransactionRecord {
  private readonly from: string
  private readonly to: string
  private readonly date: Date

  constructor(rawTransaction: TransferRecord) {
    this.from = rawTransaction.from
    this.to = rawTransaction.to
    this.date = new Date(Number(rawTransaction.time / BigInt(1000000)))
  }

  getTransactionView(): TransactionRecordView {
    return new TransactionRecordView(
      "Transfer",
      this.from,
      this.to,
      undefined,
      this.date,
    )
  }
}

export class MintTransactionRecordIcpSwap implements MintTransactionRecord {
  private readonly to: string
  private readonly date: Date
  private readonly priceFormatted: string

  constructor(rawTransaction: TransferRecord) {
    this.to = rawTransaction.to
    this.date = new Date(Number(rawTransaction.time / BigInt(1000000)))
    this.priceFormatted = `${rawTransaction.price.toString()} ICP`
  }

  getTransactionView(): TransactionRecordView {
    return new TransactionRecordView(
      "Mint",
      undefined,
      this.to,
      this.priceFormatted,
      this.date,
    )
  }
}

export class TransactionRecordIcpSwap implements MintTransactionRecord {
  private readonly to: string
  private readonly date: Date
  private readonly txType: string
  private readonly priceFormatted: string
  private readonly from: string

  constructor(rawTransaction: TransferRecord) {
    this.txType = rawTransaction.remark
    this.to = rawTransaction.to
    this.date = new Date(Number(rawTransaction.time / BigInt(1000000)))
    this.priceFormatted = `${rawTransaction.price.toString()} ICP`
    this.from = rawTransaction.from
  }

  getTransactionView(): TransactionRecordView {
    return new TransactionRecordView(
      this.txType,
      this.from,
      this.to,
      this.priceFormatted,
      this.date,
    )
  }
}
