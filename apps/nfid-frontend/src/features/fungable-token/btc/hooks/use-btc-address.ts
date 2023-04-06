import {
  getBtcAddress,
} from "src/features/fungable-token/btc/get-btc"
import useSWR from "swr"

export const useBtcAddress = () => {
  const { data: btcAddress, ...rest } = useSWR("btcAddress", getBtcAddress)

  return { btcAddress, ...rest }
}
