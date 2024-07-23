import {TransactionRecord} from "src/integration/nft/nft";
import {TransactionPrettified} from "@psychedelic/cap-js";
import {
  SaleTransactionRecord,
  TransferTransactionRecord
} from "src/integration/nft/impl/transaction/ext/ext-transactions";


export class ExtTransactionMapper {

  toTransactionRecord(transaction: TransactionPrettified): TransactionRecord | null {
    switch (transaction.operation.toLowerCase()) {
      case "sale":
        return new SaleTransactionRecord(transaction);
      case "transfer":
        return new TransferTransactionRecord(transaction);
        //TODO we need test nfts
      // case "mint":
      //   return new MintTransactionRecord(transaction);
      // case "burn":
      //   return new BurnTransactionRecord(transaction);
      default:
        console.log("Unknown transaction type: " + transaction.operation);
        return null
    }
  }

}

export const extTransactionMapper = new ExtTransactionMapper();
