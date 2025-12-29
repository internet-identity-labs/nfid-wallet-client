import { Principal } from "@dfinity/principal"

import { authState } from "@nfid/integration"
import {
  Category,
  ChainId,
  State,
} from "@nfid/integration/token/icrc1/enum/enums"
import { icrc1RegistryService } from "@nfid/integration/token/icrc1/service/icrc1-registry-service"
import { mapState } from "@nfid/integration/token/icrc1/util"
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

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

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

  const filteredTokens = allTokens.filter(
    (t) => t.getTokenCategory() !== Category.ERC20,
  )

  const [icrc1Tokens, erc20Tokens, userCanisters] = await Promise.all([
    ftService.filterNotActiveNotZeroBalancesTokens(
      filteredTokens,
      Principal.fromText(publicKey),
    ),
    fetchErc20TokensSequentially(ethAddress),
    icrc1RegistryService.getStoredUserTokens(),
  ])

  const [arbTokens, polTokens, baseTokens, ethTokens] = erc20Tokens

  const arbTokensErc20 = arbTokens.map((canister) =>
    tokenFactory
      .getCreatorByChainID(ChainId.ARB)
      .buildTokens(
        canister,
        mapState(
          userCanisters.find(
            (c) => c.network === ChainId.ARB && c.ledger === canister.address,
          )?.state ?? { Inactive: null },
        ),
      ),
  )

  const polTokensErc20 = polTokens.map((canister) =>
    tokenFactory
      .getCreatorByChainID(ChainId.POL)
      .buildTokens(
        canister,
        mapState(
          userCanisters.find(
            (c) => c.network === ChainId.POL && c.ledger === canister.address,
          )?.state ?? { Inactive: null },
        ),
      ),
  )

  const baseTokensErc20 = baseTokens.map((canister) =>
    tokenFactory
      .getCreatorByChainID(ChainId.BASE)
      .buildTokens(
        canister,
        mapState(
          userCanisters.find(
            (c) => c.network === ChainId.BASE && c.ledger === canister.address,
          )?.state ?? { Inactive: null },
        ),
      ),
  )

  const ethTokensErc20 = ethTokens.map((canister) =>
    tokenFactory
      .getCreatorByChainID(ChainId.ETH)
      .buildTokens(
        canister,
        mapState(
          userCanisters.find(
            (c) => c.network === ChainId.ETH && c.ledger === canister.address,
          )?.state ?? { Inactive: null },
        ),
      ),
  )

  const allErc20Tokens = [
    ...arbTokensErc20,
    ...polTokensErc20,
    ...baseTokensErc20,
    ...ethTokensErc20,
  ].filter((t) => t.getTokenState() !== State.Active)

  return [...icrc1Tokens, ...allErc20Tokens]
}

export const getFullUsdValue = async (nfts: NFT[], ft: FT[]) => {
  return portfolioService.getPortfolioUSDBalance(nfts, ft)
}
