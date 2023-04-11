import { getBtcFee } from "src/features/fungable-token/btc/get-btc"
import useSWR from "swr"

export const useBtcFee = () => {
  const { data: btcFee, ...rest } = useSWR("btcFee", getBtcFee)

  return { btcFee, ...rest }
}
