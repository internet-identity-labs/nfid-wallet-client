import { TransactionPrettified } from "@psychedelic/cap-js"
import {
  SaleTransactionRecordExt,
  TransferTransactionRecordExt,
} from "src/integration/nft/impl/ext/transaction/ext-transactions"
import { TransactionRecord } from "src/integration/nft/nft"

export class ExtTransactionMapper {
  toTransactionRecord(
    transaction: TransactionPrettified,
  ): TransactionRecord | null {
    switch (transaction.operation.toLowerCase()) {
      case "sale":
        return new SaleTransactionRecordExt(transaction)
      case "transfer":
        return new TransferTransactionRecordExt(transaction)
      default:
        console.error("Unknown transaction EXT type: " + transaction.operation)
        return null
    }
  }
}

export const extTransactionMapper = new ExtTransactionMapper()
