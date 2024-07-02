import { Ed25519KeyIdentity } from "@dfinity/identity"
import { Chain, getPublicKey } from "packages/integration/src/lib/lambda/ecdsa"
import { useBalanceICPAll } from "src/features/fungable-token/icp/hooks/use-balance-icp-all"
import { stringICPtoE8s } from "src/integration/wallet/utils"
import { AssetFilter, Blockchain, TokenConfig } from "src/ui/connnector/types"

import { IconSvgDfinity } from "@nfid-frontend/ui"
import { authState } from "@nfid/integration"
import {
  ICP_CANISTER_ID,
  ICP_DECIMALS,
  WALLET_FEE_E8S,
} from "@nfid/integration/token/constants"
import { TokenStandards } from "@nfid/integration/token/types"
import { toPresentation } from "@nfid/integration/token/utils"

import { useAllICRC1Token } from "frontend/features/fungable-token/icrc1"

export const useICTokens = (
  assetFilter: AssetFilter[],
): { configs: TokenConfig[]; isLoading: boolean } => {
  const { appAccountBalance, rate, isLoading } = useBalanceICPAll(
    true,
    assetFilter,
  )
  const { token: ICRC1Token, isIcrc1Loading } = useAllICRC1Token()

  return {
    configs: [
      {
        icon: IconSvgDfinity,
        tokenStandard: TokenStandards.ICP,
        title: "Internet Computer",
        currency: "ICP",
        balance: appAccountBalance?.ICP.tokenBalance,
        rate,
        decimals: ICP_DECIMALS,
        fee: BigInt(WALLET_FEE_E8S),
        toPresentation,
        transformAmount: stringICPtoE8s,
        blockchain: Blockchain.IC,
        canisterId: ICP_CANISTER_ID,
      },
      ...(ICRC1Token
        ? ICRC1Token.map(({ symbol, name, logo, ...rest }) => ({
            tokenStandard: TokenStandards.ICRC1,
            icon: logo,
            title: name,
            currency: symbol,
            blockchain: Blockchain.IC,
            ...rest,
          }))
        : []),
    ],
    isLoading: isIcrc1Loading || isLoading,
  }
}

export const getICPublicDelegation = async () => {
  const { delegationIdentity } = authState.get()

  const principal = await getPublicKey(delegationIdentity!, Chain.IC)

  return principal
}
