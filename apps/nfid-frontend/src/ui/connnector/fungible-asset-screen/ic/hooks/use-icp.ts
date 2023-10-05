import { Chain, getGlobalKeys } from "packages/integration/src/lib/lambda/ecdsa"
import { useAllDip20Token } from "src/features/fungable-token/dip-20/hooks/use-all-token-meta"
import { useBalanceICPAll } from "src/features/fungable-token/icp/hooks/use-balance-icp-all"
import { stringICPtoE8s } from "src/integration/wallet/utils"
import { AssetFilter, Blockchain, TokenConfig } from "src/ui/connnector/types"

import { IconSvgDfinity } from "@nfid-frontend/ui"
import { accessList, authState } from "@nfid/integration"
import { toPresentation, WALLET_FEE_E8S } from "@nfid/integration/token/icp"
import { TokenStandards } from "@nfid/integration/token/types"

export const useICTokens = (
  assetFilter: AssetFilter[],
): { configs: TokenConfig[]; isLoading: boolean } => {
  const { appAccountBalance, isLoading } = useBalanceICPAll(true, assetFilter)
  const { token: dip20Token } = useAllDip20Token()

  return {
    configs: [
      {
        icon: IconSvgDfinity,
        tokenStandard: TokenStandards.ICP,
        title: "Internet Computer",
        currency: "ICP",
        balance: appAccountBalance?.ICP.tokenBalance,
        price: appAccountBalance?.ICP.usdBalance,
        fee: BigInt(WALLET_FEE_E8S),
        toPresentation,
        transformAmount: stringICPtoE8s,
        blockchain: Blockchain.IC,
      },
      ...(dip20Token
        ? dip20Token.map(({ symbol, name, logo, ...rest }) => ({
            tokenStandard: TokenStandards.DIP20,
            icon: logo,
            title: name,
            currency: symbol,
            balance: appAccountBalance?.[symbol].tokenBalance,
            price: appAccountBalance?.[symbol].usdBalance,
            blockchain: Blockchain.IC,
            ...rest,
          }))
        : []
      ).filter((token) => token.balance > 0),
    ],
    isLoading,
  }
}

export const getICPublicDelegation = async () => {
  const { delegationIdentity } = authState.get()

  const publicDelegation = await getGlobalKeys(
    delegationIdentity!,
    Chain.IC,
    accessList,
  )

  return publicDelegation
}
