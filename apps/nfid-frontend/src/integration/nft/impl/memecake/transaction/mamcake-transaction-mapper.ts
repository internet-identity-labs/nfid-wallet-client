import {TransactionRecord} from "src/integration/nft/nft";
import {Transaction} from "src/integration/nft/impl/memecake/transaction/transaction-types";
import {SoldTransactionRecordMemeCake} from "src/integration/nft/impl/memecake/transaction/memecake-transactions";

export class MemeCakeTransactionMapper {
  toTransactionRecord(
    transaction: Transaction,
  ): TransactionRecord | null {
    switch (transaction.transctionType) {
      case "Buy":
        return new SoldTransactionRecordMemeCake(transaction)
      default:
        console.error("Unknown transaction MemeCake type: " + transaction.transctionType)
        return null
    }
  }
}

export const memeCakeTransactionMapper = new MemeCakeTransactionMapper()
