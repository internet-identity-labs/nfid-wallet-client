import { TransactionRecordToniq } from "src/integration/nft/impl/ext/transaction/toniq-transaction-mapper"
import { TransactionRecord } from "src/integration/nft/nft"

export class ExtTransactionMapper {
  toTransactionRecordToniq(
    transaction: TransactionToniq,
  ): TransactionRecord | null {
    return new TransactionRecordToniq(transaction)
  }
}

export const extTransactionMapper = new ExtTransactionMapper()
