import { AccountIdentifier } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"
import useSWR from "swr"

import { getBalance } from "@nfid/integration"

export function useBalanceICP(principal: Principal) {
  const { data: balance, ...rest } = useSWR(
    [AccountIdentifier.fromPrincipal({ principal }).toHex()],
    ([address]) => getBalance(address),
    {
      dedupingInterval: 60000,
      refreshInterval: 60000,
    },
  )

  return {
    balance,
    ...rest,
  }
}
