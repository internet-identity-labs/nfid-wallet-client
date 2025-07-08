import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"

import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"

import { FT } from "../ft/ft"
import { ftService } from "../ft/ft-service"
import { NFT } from "../nft/nft"
import { nftService } from "../nft/nft-service"

export class PortfolioService {
  async getPortfolioUSDBalance(
    userPublicKey: Principal,
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
    const icp = ft.find((token) => token.getTokenAddress() === ICP_CANISTER_ID)
    if (!icp?.isInited()) await icp?.init(userPublicKey)

    const FTUSDBalance = await ftService.getFTUSDBalance(ft)

    const FTValue = FTUSDBalance?.value
    const FTValue24h = FTUSDBalance?.value24h

    const NFTUSDBalance = await nftService.getNFTsTotalPrice(nfts, icp)
    const NFTValue = NFTUSDBalance?.value
    const NFTValue24h = NFTUSDBalance?.value24h

    const valueSum = BigNumber(Number(FTValue) + Number(NFTValue))
    const valueSum24h = BigNumber(Number(FTValue24h) + Number(NFTValue24h))

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
