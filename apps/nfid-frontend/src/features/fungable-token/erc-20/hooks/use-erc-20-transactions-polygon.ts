import useSWR from "swr"
import { getErc20TransactionHistory } from "src/features/fungable-token/erc-20/get-erc-20-polygon";

export const useErc20TransactionsPolygon = () => {
  const { data: erc20txs, ...rest } = useSWR(
    "erc20txsPolygon",
    getErc20TransactionHistory,
  )

  return { erc20txs: erc20txs, ...rest }
}
