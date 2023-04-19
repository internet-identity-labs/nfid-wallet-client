import { getErc20TransactionHistory } from "src/features/fungable-token/erc-20/get-erc-20"
import useSWR from "swr"

export const useErc20Transactions = () => {
  const { data: erc20txs, ...rest } = useSWR(
    "erc20txs",
    getErc20TransactionHistory,
  )

  return { erc20txs: erc20txs, ...rest }
}
