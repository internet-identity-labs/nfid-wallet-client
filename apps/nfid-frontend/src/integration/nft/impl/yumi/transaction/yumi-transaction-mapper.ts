import {TransactionRecord} from "src/integration/nft/nft"
import {
  ListTransactionRecordYumi,
  SoldTransactionRecordYumi
} from "src/integration/nft/impl/yumi/transaction/yumi-transactions";
import {TransactionRecordData} from "src/integration/nft/impl/yumi/transaction/yumi-trs-types";

export class YumiTransactionMapper {
  toTransactionRecord(
    transaction: TransactionRecordData,
  ): TransactionRecord | null {
    switch (transaction.eventType.toLowerCase()) {
      case "list":
        return new ListTransactionRecordYumi(transaction)
      case "sold":
        return new SoldTransactionRecordYumi(transaction)
      default:
        console.error("Unknown YUMI transaction type: " + transaction.eventType)
        return null
    }
  }
}

export const yumiTransactionMapper = new YumiTransactionMapper()
