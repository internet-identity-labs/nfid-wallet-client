import { getAccounts } from "src/features/fungable-token/btc/get-btc"
import useSWR from "swr"

export const useBtcBalance = () => {
  const { data: balances, ...rest } = useSWR("btcBalance", getAccounts)

  return { balances, ...rest }
}
