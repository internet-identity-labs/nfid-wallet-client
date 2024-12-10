import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"
import { FT } from "src/integration/ft/ft"
import { FTImpl } from "src/integration/ft/impl/ft-impl"
import { nftService } from "src/integration/nft/nft-service"

import { Category } from "@nfid/integration/token/icrc1/enum/enums"
import { icrc1StorageService } from "@nfid/integration/token/icrc1/service/icrc1-storage-service"

const sortTokens = (tokens: FT[]) => {
  const categoryOrder: Record<Category, number> = {
    [Category.Sns]: 3,
    [Category.ChainFusion]: 2,
    [Category.Known]: 4,
    [Category.Native]: 1,
    [Category.Community]: 5,
    [Category.Spam]: 7,
    [Category.ChainFusionTestnet]: 6,
  }

  return tokens.sort((a, b) => {
    const aCategory =
      categoryOrder[a.getTokenCategory()] || Number.MAX_SAFE_INTEGER
    const bCategory =
      categoryOrder[b.getTokenCategory()] || Number.MAX_SAFE_INTEGER
    return aCategory - bCategory
  })
}

export const filterTokens = (ft: FT[], filterText: string): FT[] => {
  return ft.filter(
    (token) =>
      token.getTokenName().toLowerCase().includes(filterText.toLowerCase()) ||
      token.getTokenSymbol().toLowerCase().includes(filterText.toLowerCase()),
  )
}

export class FtService {
  async getTokens(userId: string): Promise<Array<FT>> {
    return icrc1StorageService.getICRC1Canisters(userId).then((canisters) => {
      const ft = canisters.map((canister) => new FTImpl(canister))
      return sortTokens(ft)
    })
  }

  //todo move somewhere because contains NFT balance as well
  async getTotalUSDBalance(
    userPublicKey: Principal,
    ft: FT[],
  ): Promise<string | undefined> {
    const [nftPrice] = await Promise.all([
      nftService.getNFTsTotalPrice(userPublicKey),
    ])
    let price = ft
      .map((ft) => ft.getUSDBalance())
      .filter((balance) => balance !== undefined)
      .reduce(
        (acc: BigNumber, balance: BigNumber) => acc.plus(balance),
        BigNumber(0),
      )
    price = price.plus(nftPrice)
    return price.toFixed(2)
  }
}

export const ftService = new FtService()
