import { getAccountsMatic } from "src/features/fungable-token/matic/get-matic"
import useSWR from "swr"

export const useMaticBalance = () => {
  const { data: balances, ...rest } = useSWR("maticBalance", getAccountsMatic)

  return { balances, ...rest }
}
