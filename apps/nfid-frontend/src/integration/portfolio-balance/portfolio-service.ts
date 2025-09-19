import BigNumber from "bignumber.js"

import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"

import { FT } from "../ft/ft"
import { ftService } from "../ft/ft-service"
import { NFT } from "../nft/nft"
import { nftService } from "../nft/nft-service"
import { tokenManager } from "../../features/fungible-token/token-manager"
import { stakingService } from "../staking/service/staking-service-impl"

export class PortfolioService {
  async getPortfolioUSDBalance(
    nfts: NFT[] | undefined,
    ft: FT[],
  ): Promise<
    | {
        value: string
        dayChangePercent?: string
        dayChange?: string
        dayChangePositive?: boolean
      }
    | undefined
  > {
    const cachedTokens = tokenManager.getCachedTokens(ft)

    const icp = cachedTokens.find(
      (token) => token.getTokenAddress() === ICP_CANISTER_ID,
    )
    if (icp && !icp.isInited()) {
      await tokenManager.initializeToken(icp, false, false)
    }

    const [FTUSDBalance, NFTUSDBalance, StakingBalance] = await Promise.all([
      ftService.getFTUSDBalance(cachedTokens),
      nftService.getNFTsTotalPrice(nfts, icp),
      stakingService.getStakingUSDBalance(),
    ])

    const FTValue = FTUSDBalance?.value || "0"
    const FTValue24h = FTUSDBalance?.value24h || "0"

    const NFTValue = NFTUSDBalance?.value || "0"
    const NFTValue24h = NFTUSDBalance?.value24h || "0"

    const StakingValue = StakingBalance?.value || "0"
    const StakingValue24h = StakingBalance?.value24h || "0"

    const valueSum = BigNumber(
      Number(FTValue) + Number(NFTValue) + Number(StakingValue),
    )
    const valueSum24h = BigNumber(
      Number(FTValue24h) + Number(NFTValue24h) + Number(StakingValue24h),
    )

    return {
      value: valueSum.toFixed(2),
      dayChangePercent: valueSum24h.eq(0)
        ? "0.00"
        : valueSum
            .minus(valueSum24h)
            .div(valueSum24h)
            .multipliedBy(100)
            .toFixed(2),
      dayChange: valueSum.minus(valueSum24h).toFixed(2),
      dayChangePositive: valueSum.minus(valueSum24h).gte(0),
    }
  }
}

export const portfolioService = new PortfolioService()
