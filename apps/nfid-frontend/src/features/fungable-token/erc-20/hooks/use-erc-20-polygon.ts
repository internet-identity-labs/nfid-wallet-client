import { getErc20Tokens } from "src/features/fungable-token/erc-20/get-erc-20-polygon"
import useSWR from "swr"

export const useErc20Polygon = () => {
  const { data: erc20, ...rest } = useSWR("erc20Polygon", getErc20Tokens)

  return { erc20, ...rest }
}
