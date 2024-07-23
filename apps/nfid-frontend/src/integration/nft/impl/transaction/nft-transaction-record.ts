import { TransactionType } from "src/integration/nft/enum/enums"
import { TransactionRecord } from "src/integration/nft/nft"

export abstract class TransactionRecordAbstract implements TransactionRecord {
  abstract getDate(): Date
  abstract getType(): TransactionType
}

export interface TransferTransactionRecordI extends TransactionRecordAbstract {
  getFrom(): string
  getTo(): string
}

export interface SellTransactionRecordI extends TransactionRecordAbstract {
  getPrice(): bigint
  getFrom(): string
  getTo(): string
}

export interface MintTransactionRecord extends TransactionRecordAbstract {
  getTo(): string
}

export interface BurnTransactionRecord extends TransactionRecordAbstract {
  getFrom(): string
}
