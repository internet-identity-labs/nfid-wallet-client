import { getBtcBalance } from "src/features/fungable-token/btc/get-btc-balance"
import useSWR from "swr"

export const useBtcBalance = () => {
  const { data: balances, ...rest } = useSWR("btcBalance", getBtcBalance)

  return { balances, ...rest }
}
