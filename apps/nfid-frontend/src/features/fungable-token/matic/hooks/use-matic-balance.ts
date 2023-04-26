import useSWR from "swr";
import { getAccountsMatic } from "src/features/fungable-token/matic/get-matic";

export const useMaticBalance = () => {
  const { data: balances, ...rest } = useSWR("maticBalance", getAccountsMatic)

  return { balances, ...rest }
}
