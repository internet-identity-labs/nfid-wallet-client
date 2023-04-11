import { getBtcAddress } from "src/features/fungable-token/btc/get-btc"
import useSWRImmutable from "swr/immutable"

export const useBtcAddress = () => {
  const { data: btcAddress, ...rest } = useSWRImmutable(
    "btcAddress",
    getBtcAddress,
  )

  return { btcAddress, ...rest }
}
