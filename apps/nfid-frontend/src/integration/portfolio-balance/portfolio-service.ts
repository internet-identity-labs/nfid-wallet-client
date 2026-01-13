import BigNumber from "bignumber.js"

import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"

import { FT } from "../ft/ft"
import { ftService } from "../ft/ft-service"
import { NFT } from "../nft/nft"
import { nftService } from "../nft/nft-service"
import { stakingService } from "../staking/service/staking-service-impl"

export class PortfolioService {
  async getPortfolioUSDBalance(
    nfts: NFT[],
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
    const icp = ft.find((token) => token.getTokenAddress() === ICP_CANISTER_ID)

    const [ftUSDBalance, nftUSDBalance, stakingBalance] = await Promise.all([
      ftService.getFTUSDBalance(ft),
      nftService.getNFTsTotalPrice(nfts, icp),
      stakingService.getStakingUSDBalance(ft),
    ])

    const ftValue = ftUSDBalance?.value || "0"
    const ftValue24h = ftUSDBalance?.value24h || "0"

    const nftValue = nftUSDBalance?.value || "0"
    const nftValue24h = nftUSDBalance?.value24h || "0"

    const stakingValue = stakingBalance?.value || "0"
    const stakingValue24h = stakingBalance?.value24h || "0"

    const valueSum = BigNumber(
      Number(ftValue) + Number(nftValue) + Number(stakingValue),
    )
    const valueSum24h = BigNumber(
      Number(ftValue24h) + Number(nftValue24h) + Number(stakingValue24h),
    )

    return {
      value: valueSum.toString(),
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
