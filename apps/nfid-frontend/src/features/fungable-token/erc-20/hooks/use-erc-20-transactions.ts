import {
  getErc20TransactionHistory,
  getGoerliErc20TransactionHistory,
} from "src/features/fungable-token/erc-20/get-erc-20"
import useSWR from "swr"

export const useErc20Transactions = () => {
  const { data: erc20txs, ...rest } = useSWR(
    "erc20txs",
    getErc20TransactionHistory,
  )

  return { erc20txs: erc20txs, ...rest }
}

export const useErc20GoerliTransactions = () => {
  const { data: erc20txs, ...rest } = useSWR(
    "erc20goerliTxs",
    getGoerliErc20TransactionHistory,
  )

  return { erc20goerlitxs: erc20txs, ...rest }
}
