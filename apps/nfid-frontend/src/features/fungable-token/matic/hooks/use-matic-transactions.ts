import {
  getMaticMumbaiTransactionHistory,
  getMaticTransactionHistory,
} from "src/features/fungable-token/matic/get-matic"
import useSWR from "swr"

export const useMaticTransactions = () => {
  const { data: txs, ...rest } = useSWR(
    "maticTransactions",
    getMaticTransactionHistory,
  )

  return { txs, ...rest }
}
export const useMaticMumbaiTransactions = () => {
  const { data: txs, ...rest } = useSWR(
    "maticMumbaiTransactions",
    getMaticMumbaiTransactionHistory,
  )

  return { txs, ...rest }
}
