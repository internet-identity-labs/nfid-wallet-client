import { useSWR } from "@nfid/swr"

import { fetchBtcAddress } from "frontend/util/fetch-btc-address"

export const useBtcAddress = () => {
  const { isLoading, mutate } = useSWR("btcAddress", fetchBtcAddress, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  })

  return { fetchBtcAddress: () => mutate(), isBtcAddressLoading: isLoading }
}
