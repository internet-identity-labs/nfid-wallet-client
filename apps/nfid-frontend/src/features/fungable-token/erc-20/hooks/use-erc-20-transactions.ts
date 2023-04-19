import { getErc20TransactionHistory } from "src/features/fungable-token/erc-20/get-erc-20"
import useSWR from "swr"

export const useErc20Transactions = () => {
  const { data: erc20tsx, ...rest } = useSWR(
    "erc20tsx",
    getErc20TransactionHistory,
  )

  return { erc20tsx, ...rest }
}
