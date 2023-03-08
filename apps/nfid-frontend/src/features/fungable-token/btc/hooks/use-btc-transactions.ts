import { getBtcTransactionHistory } from "src/features/fungable-token/btc/get-btc"
import useSWR from "swr"

export const useBtcTransactions = () => {
  const { data: txs, ...rest } = useSWR(
    "btcTransactions",
    getBtcTransactionHistory,
  )

  return { txs, ...rest }
}
