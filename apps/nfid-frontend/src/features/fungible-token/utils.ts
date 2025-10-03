import { Principal } from "@dfinity/principal"

import { authState } from "@nfid/integration"

import { FT } from "frontend/integration/ft/ft"
import { ftService } from "frontend/integration/ft/ft-service"
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
) => {
  const { publicKey } = await getUserPrincipalId()
  return await ftService.filterNotActiveNotZeroBalancesTokens(
    allTokens,
    Principal.fromText(publicKey),
  )
}

export const getFullUsdValue = async (nfts: NFT[], ft: FT[]) => {
  return portfolioService.getPortfolioUSDBalance(nfts, ft)
}
