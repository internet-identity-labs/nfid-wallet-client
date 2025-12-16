import { Principal } from "@dfinity/principal"

import { authState } from "@nfid/integration"
import { ChainId, State } from "@nfid/integration/token/icrc1/enum/enums"
import { arbitrumErc20Service } from "frontend/integration/ethereum/arbitrum/arbitrum-erc20.service"
import { baseErc20Service } from "frontend/integration/ethereum/base/base-erc20.service"
import { ethErc20Service } from "frontend/integration/ethereum/eth/eth-erc20.service"
import { polygonErc20Service } from "frontend/integration/ethereum/polygon/pol-erc20.service"

import { FT } from "frontend/integration/ft/ft"
import { ftService } from "frontend/integration/ft/ft-service"
import { tokenFactory } from "frontend/integration/ft/token-creator/token-factory.service"
import { NFT } from "frontend/integration/nft/nft"
import { portfolioService } from "frontend/integration/portfolio-balance/portfolio-service"

//TODO move to authState
export const getUserPrincipalId = async (): Promise<{
  userPrincipal: string
  publicKey: string
}> => {
  const pair = authState.getUserIdData()
  return {
    userPrincipal: pair.userId,
    publicKey: pair.publicKey,
  }
}

export const fetchTokens = async () => {
  const { userPrincipal } = await getUserPrincipalId()
  return await ftService.getTokens(userPrincipal)
}

export const filterNotActiveNotZeroBalancesTokens = async (
  allTokens: Array<FT>,
  ethAddress: string,
  isEthAddressLoading: boolean,
) => {
  if (isEthAddressLoading) return
  const { publicKey } = await getUserPrincipalId()

  const [icrc1Tokens, arbTokens, polTokens, baseTokens, ethTokens] =
    await Promise.all([
      ftService.filterNotActiveNotZeroBalancesTokens(
        allTokens,
        Principal.fromText(publicKey),
      ),
      arbitrumErc20Service.getTokensWithNonZeroBalance(ethAddress),
      polygonErc20Service.getTokensWithNonZeroBalance(ethAddress),
      baseErc20Service.getTokensWithNonZeroBalance(ethAddress),
      ethErc20Service.getTokensWithNonZeroBalance(ethAddress),
    ])

  const arbTokensErc20 = arbTokens.map((canister) =>
    tokenFactory.getCreatorByChainID(ChainId.ARB).buildTokens(canister),
  )

  const polTokensErc20 = polTokens.map((canister) =>
    tokenFactory.getCreatorByChainID(ChainId.ARB).buildTokens(canister),
  )

  const baseTokensErc20 = baseTokens.map((canister) =>
    tokenFactory.getCreatorByChainID(ChainId.ARB).buildTokens(canister),
  )

  const ethTokensErc20 = ethTokens.map((canister) =>
    tokenFactory.getCreatorByChainID(ChainId.ARB).buildTokens(canister),
  )

  const nativeTokens: FT[] = [
    tokenFactory.getCreatorByChainID(ChainId.POL).buildNative(State.Active),
    tokenFactory.getCreatorByChainID(ChainId.ARB).buildNative(State.Active),
    tokenFactory.getCreatorByChainID(ChainId.BASE).buildNative(State.Active),
  ]

  return [
    ...icrc1Tokens,
    ...arbTokensErc20,
    ...polTokensErc20,
    ...baseTokensErc20,
    ...ethTokensErc20,
    ...nativeTokens,
  ]
}

export const getFullUsdValue = async (nfts: NFT[], ft: FT[]) => {
  return portfolioService.getPortfolioUSDBalance(nfts, ft)
}
