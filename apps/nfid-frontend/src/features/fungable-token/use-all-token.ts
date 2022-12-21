import React from "react"

import { IconSvgDfinity } from "@nfid-frontend/ui"
import { toPresentation, WALLET_FEE_E8S } from "@nfid/integration/token/icp"

import { useAllTokenMeta } from "./dip-20/hooks/use-all-token-meta"
import { useBalanceICPAll } from "./icp/hooks/use-balance-icp-all"

export const useAllToken = () => {
  const { appAccountBalance } = useBalanceICPAll()
  const { token: dip20Token } = useAllTokenMeta()
  console.debug("useAllToken", { dip20Token })

  const token = React.useMemo(() => {
    return [
      {
        icon: IconSvgDfinity,
        title: "ICP",
        currency: "ICP",
        balance: appAccountBalance?.ICP.tokenBalance,
        price: appAccountBalance?.ICP.usdBalance,
        fee: BigInt(WALLET_FEE_E8S),
        toPresentation,
      },
      ...(dip20Token
        ? dip20Token.map(({ symbol, name, logo, fee, decimals }) => ({
            icon: logo,
            title: name,
            currency: symbol,
            balance: appAccountBalance?.[symbol].tokenBalance,
            price: appAccountBalance?.[symbol].usdBalance,
            fee,
            toPresentation: (value: bigint = BigInt(0)) => {
              return Number(value) / Number(BigInt(10 ** decimals))
            },
          }))
        : []),
    ]
  }, [appAccountBalance, dip20Token])
  console.debug("useAllToken", { token })
  return { token }
}
