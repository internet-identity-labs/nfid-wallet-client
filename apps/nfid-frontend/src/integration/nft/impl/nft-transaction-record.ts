import {TransactionRecord} from "src/integration/nft/nft"

export abstract class TransactionRecordAbstract implements TransactionRecord {
  abstract getTransactionView(): TransactionRecordView
}

export type TransactionRecordView = {
  date: string
  type: string
  from: string | undefined
  to: string | undefined
  price: string | undefined
}

export interface TransferTransactionRecord extends TransactionRecordAbstract {
}

export interface SellTransactionRecord extends TransactionRecordAbstract {
}

export interface MintTransactionRecord extends TransactionRecordAbstract {
}

export interface BurnTransactionRecord extends TransactionRecordAbstract {
}

export interface ListTransactionRecord extends TransactionRecordAbstract {
}

export interface ClaimTransactionRecord extends TransactionRecordAbstract {
}
