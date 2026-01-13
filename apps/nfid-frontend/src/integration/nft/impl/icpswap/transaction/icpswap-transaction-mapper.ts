import { TransferRecord } from "src/integration/nft/impl/icpswap/idl/SwapNFT.d"
import {
  MintTransactionRecordIcpSwap,
  TransactionRecordIcpSwap,
  TransferTransactionRecordIcpSwap,
} from "src/integration/nft/impl/icpswap/transaction/icpswap-transaction"
import { TransactionRecord } from "src/integration/nft/nft"

export class IcpswapTransactionMapper {
  toTransactionRecord(transaction: TransferRecord): TransactionRecord | null {
    switch (transaction.remark) {
      case "Transfer":
        return new TransferTransactionRecordIcpSwap(transaction)
      case "Mint":
        return new MintTransactionRecordIcpSwap(transaction)
      case "Burn":
        return new TransactionRecordIcpSwap(transaction)
      case "Approve":
        return new TransactionRecordIcpSwap(transaction)
      default:
        console.error(`Unknown transaction IcpSwap type: ${transaction.remark}`)
        return null
    }
  }
}

export const icpswapTransactionMapper = new IcpswapTransactionMapper()
