import React from "react"

import { IconSvgDfinity } from "@nfid-frontend/ui"
import { toPresentation, WALLET_FEE_E8S } from "@nfid/integration/token/icp"
import { TokenStandards } from "@nfid/integration/token/types"

import { stringICPtoE8s } from "frontend/integration/wallet/utils"

import { useAllDip20Token } from "./dip-20/hooks/use-all-token-meta"
import { useBalanceICPAll } from "./icp/hooks/use-balance-icp-all"

export interface TokenConfig {
  balance: bigint | undefined
  currency: string
  fee: bigint
  icon: string
  price: string | undefined
  title: string
  canisterId?: string
  tokenStandard: TokenStandards
  toPresentation: (value?: bigint) => number
  transformAmount: (value: string) => number
}

export const useAllToken = (): { token: TokenConfig[] } => {
  const { appAccountBalance } = useBalanceICPAll()
  const { token: dip20Token } = useAllDip20Token()

  const token: TokenConfig[] = React.useMemo(() => {
    return [
      {
        icon: IconSvgDfinity,
        tokenStandard: TokenStandards.ICP,
        title: "ICP",
        currency: "ICP",
        balance: appAccountBalance?.ICP.tokenBalance,
        price: appAccountBalance?.ICP.usdBalance,
        fee: BigInt(WALLET_FEE_E8S),
        toPresentation,
        transformAmount: stringICPtoE8s,
      },
      ...(dip20Token
        ? dip20Token.map(({ symbol, name, logo, ...rest }) => ({
            tokenStandard: TokenStandards.DIP20,
            icon: logo,
            title: name,
            currency: symbol,
            balance: appAccountBalance?.[symbol].tokenBalance,
            price: appAccountBalance?.[symbol].usdBalance,
            ...rest,
          }))
        : []),
    ]
  }, [appAccountBalance, dip20Token])
  console.debug("useAllToken", { token })
  return { token }
}
