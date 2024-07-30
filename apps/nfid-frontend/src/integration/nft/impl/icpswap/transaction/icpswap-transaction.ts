import {
  MintTransactionRecord,
  TransactionRecordView,
  TransferTransactionRecord
} from "src/integration/nft/impl/nft-transaction-record";
import {TransferRecord} from "src/integration/nft/impl/icpswap/idl/SwapNFT.d";

export class TransferTransactionRecordIcpSwap implements TransferTransactionRecord {
  private readonly from: string
  private readonly to: string
  private readonly date: Date
  private readonly txType: string

  constructor(rawTransaction: TransferRecord) {
    this.txType = rawTransaction.remark
    this.from = rawTransaction.from
    this.to = rawTransaction.to
    this.date = new Date(Number(rawTransaction.time / BigInt(1000000)))
  }

  getTransactionView(): TransactionRecordView {
    return {
      type: this.txType,
      date: this.date.toISOString(),
      from: this.from,
      to: this.to,
      price: undefined,
    }
  }
}

export class MintTransactionRecordIcpSwap implements MintTransactionRecord {
  private readonly to: string
  private readonly date: Date
  private readonly txType: string
  private readonly price: bigint

  constructor(rawTransaction: TransferRecord) {
    this.txType = rawTransaction.remark
    this.to = rawTransaction.to
    this.date = new Date(Number(rawTransaction.time / BigInt(1000000)))
    this.price = rawTransaction.price
  }

  getTransactionView(): TransactionRecordView {
    return {
      type: this.txType,
      date: this.date.toISOString(),
      from: undefined,
      to: this.to,
      price: this.price.toString() + " ICP",
    }
  }
}

export class TransactionRecordIcpSwap implements MintTransactionRecord {
  private readonly to: string
  private readonly date: Date
  private readonly txType: string
  private readonly price: bigint
  private readonly from: string

  constructor(rawTransaction: TransferRecord) {
    this.txType = rawTransaction.remark
    this.to = rawTransaction.to
    this.date = new Date(Number(rawTransaction.time / BigInt(1000000)))
    this.price = rawTransaction.price
    this.from = rawTransaction.from
  }

  getTransactionView(): TransactionRecordView {
    return {
      type: this.txType,
      date: this.date.toISOString(),
      from: undefined,
      to: this.to,
      price: this.price.toString() + " ICP",
    }
  }
}
