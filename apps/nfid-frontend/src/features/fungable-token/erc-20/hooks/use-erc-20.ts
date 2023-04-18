import { getErc20Tokens } from "src/features/fungable-token/erc-20/get-erc-20"
import useSWR from "swr"

export const useErc20 = () => {
  const { data: erc20, ...rest } = useSWR("erc20", getErc20Tokens)

  return { erc20, ...rest }
}
