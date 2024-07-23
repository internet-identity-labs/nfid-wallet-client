import { TransactionPrettified } from "@psychedelic/cap-js"
import {
  SaleTransactionRecord,
  TransferTransactionRecord,
} from "src/integration/nft/impl/transaction/ext/ext-transactions"
import { TransactionRecord } from "src/integration/nft/nft"

export class ExtTransactionMapper {
  toTransactionRecord(
    transaction: TransactionPrettified,
  ): TransactionRecord | null {
    switch (transaction.operation.toLowerCase()) {
      case "sale":
        return new SaleTransactionRecord(transaction)
      case "transfer":
        return new TransferTransactionRecord(transaction)
      //TODO we need test nfts
      // case "mint":
      //   return new MintTransactionRecord(transaction);
      // case "burn":
      //   return new BurnTransactionRecord(transaction);
      default:
        console.error("Unknown transaction type: " + transaction.operation)
        return null
    }
  }
}

export const extTransactionMapper = new ExtTransactionMapper()
