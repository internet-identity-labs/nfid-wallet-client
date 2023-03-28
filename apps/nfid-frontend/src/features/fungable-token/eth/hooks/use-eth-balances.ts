import useSWR from "swr"

import { getEthBalance } from "../get-eth-balance"

export const useEthBalance = () => {
  const { data: balance, ...rest } = useSWR("ethBalance", getEthBalance)

  return { balance, ...rest }
}
