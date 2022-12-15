import React from "react"

import Dfinity from "frontend/assets/dfinity.svg"

import { useAllTokenMeta } from "./dip-20/hooks/use-all-token-meta"
import { useBalanceICPAll } from "./icp/hooks/use-balance-icp-all"

export const useAllToken = () => {
  const { appAccountBalance } = useBalanceICPAll()
  const { token: dip20Token } = useAllTokenMeta()
  console.debug("useAllToken", { dip20Token })

  const token = React.useMemo(() => {
    return [
      {
        icon: Dfinity,
        title: "ICP",
        currency: "ICP",
        balance: appAccountBalance?.tokenBalance,
        price: appAccountBalance?.usdBalance,
      },
      ...(dip20Token
        ? dip20Token.map((token) => ({
            icon: token.logo,
            title: token.name,
            currency: token.symbol,
            balance: BigInt(0),
            price: "0",
          }))
        : []),
    ]
  }, [appAccountBalance, dip20Token])
  return { token }
}
