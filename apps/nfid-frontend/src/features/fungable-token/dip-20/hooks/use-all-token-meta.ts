import useSWR from "swr"

import { getAllToken } from "@nfid/integration/token/dip-20"

export const useAllToken = () => {
  const { data: token, isValidating } = useSWR("dip20AllToken", getAllToken, {
    dedupingInterval: 60_000 * 60,
    focusThrottleInterval: 60_000 * 60,
  })

  return { token, isValidating }
}
