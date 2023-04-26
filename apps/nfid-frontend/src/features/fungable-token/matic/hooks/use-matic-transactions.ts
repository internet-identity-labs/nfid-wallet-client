import { getBtcTransactionHistory } from "src/features/fungable-token/btc/get-btc"
import useSWR from "swr"
import { getMaticTransactionHistory } from "src/features/fungable-token/matic/get-matic";

export const useMaticTransactions = () => {
  const { data: txs, ...rest } = useSWR(
    "maticTransactions",
    getMaticTransactionHistory,
  )

  return { txs, ...rest }
}
