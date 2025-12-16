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

const fetchErc20TokensSequentially = async (
  ethAddress: string,
): Promise<
  [
    Awaited<
      ReturnType<typeof arbitrumErc20Service.getTokensWithNonZeroBalance>
    >,
    Awaited<ReturnType<typeof polygonErc20Service.getTokensWithNonZeroBalance>>,
    Awaited<ReturnType<typeof baseErc20Service.getTokensWithNonZeroBalance>>,
    Awaited<ReturnType<typeof ethErc20Service.getTokensWithNonZeroBalance>>,
  ]
> => {
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms))

  const arbTokens =
    await arbitrumErc20Service.getTokensWithNonZeroBalance(ethAddress)
  await delay(500)

  const polTokens =
    await polygonErc20Service.getTokensWithNonZeroBalance(ethAddress)
  await delay(500)

  const baseTokens =
    await baseErc20Service.getTokensWithNonZeroBalance(ethAddress)
  await delay(500)

  const ethTokens =
    await ethErc20Service.getTokensWithNonZeroBalance(ethAddress)

  return [arbTokens, polTokens, baseTokens, ethTokens]
}

export const filterNotActiveNotZeroBalancesTokens = async (
  allTokens: Array<FT>,
  ethAddress: string,
  isEthAddressLoading: boolean,
) => {
  if (isEthAddressLoading) return
  const { publicKey } = await getUserPrincipalId()

  const [icrc1Tokens, erc20Tokens] = await Promise.all([
    ftService.filterNotActiveNotZeroBalancesTokens(
      allTokens,
      Principal.fromText(publicKey),
    ),
    fetchErc20TokensSequentially(ethAddress),
  ])

  const [arbTokens, polTokens, baseTokens, ethTokens] = erc20Tokens

  const arbTokensErc20 = arbTokens.map((canister) =>
    tokenFactory.getCreatorByChainID(ChainId.ARB).buildTokens(canister),
  )

  const polTokensErc20 = polTokens.map((canister) =>
    tokenFactory.getCreatorByChainID(ChainId.POL).buildTokens(canister),
  )

  const baseTokensErc20 = baseTokens.map((canister) =>
    tokenFactory.getCreatorByChainID(ChainId.BASE).buildTokens(canister),
  )

  const ethTokensErc20 = ethTokens.map((canister) =>
    tokenFactory.getCreatorByChainID(ChainId.ETH).buildTokens(canister),
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
