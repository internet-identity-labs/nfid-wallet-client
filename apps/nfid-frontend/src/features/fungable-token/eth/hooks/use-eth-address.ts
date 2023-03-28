import useSWR from "swr"

import { useProfile } from "frontend/integration/identity-manager/queries"

import { getEthAddress } from "../get-eth-address"

export const useEthAddress = () => {
  const { profile } = useProfile()
  const { data: address, ...rest } = useSWR(
    profile?.anchor ? [profile.anchor] : null,
    ([anchor]) => getEthAddress(anchor),
  )

  return { address, ...rest }
}
