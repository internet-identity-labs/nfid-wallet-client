import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"
import { FT } from "src/integration/ft/ft"
import { FTImpl } from "src/integration/ft/impl/ft-impl"
import { PaginatedResponse } from "src/integration/nft/impl/nft-types"
import { nftService } from "src/integration/nft/nft-service"

import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"
import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { Category } from "@nfid/integration/token/icrc1/enum/enums"
import { icrc1RegistryService } from "@nfid/integration/token/icrc1/service/icrc1-registry-service"
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

export class FtService {
  async getAllUserTokens(
    userId: string,
    page: number = 1,
    limit: number = Number.MAX_SAFE_INTEGER,
  ): Promise<PaginatedResponse<FT>> {
    let userTokens = await icrc1StorageService
      .getICRC1ActiveCanisters(userId)
      .then(async (canisters) => {
        if (canisters.length === 0) {
          await icrc1RegistryService.storeICRC1Canister(
            ICP_CANISTER_ID,
            State.Active,
          )
          canisters = await icrc1StorageService.getICRC1Canisters(userId)
        }
        return canisters.filter((canister) => canister.state === State.Active)
      })

    let ft: Array<FT> = userTokens.map((token) => new FTImpl(token))

    const sortedTokens = sortTokens(ft)

    const totalItems = sortedTokens.length
    const totalPages = Math.ceil(totalItems / limit)

    const startIndex = (page - 1) * limit
    const endIndex = Math.min(startIndex + limit, totalItems)

    const items = sortedTokens.slice(startIndex, endIndex)

    return {
      items,
      currentPage: page,
      totalPages,
      totalItems,
    }
  }

  async getAllTokens(
    userId: string,
    nameCategoryFilter: string | undefined,
  ): Promise<Array<FT>> {
    return icrc1StorageService
      .getICRC1FilteredCanisters(userId, nameCategoryFilter)
      .then((canisters) => {
        const ft = canisters.map((canister) => new FTImpl(canister))
        return sortTokens(ft)
      })
  }

  async getUserTokenByAddress(
    userId: string,
    address: string,
    page: number = 1,
    limit: number = Number.MAX_SAFE_INTEGER,
  ): Promise<FT> {
    const tokens = await this.getAllUserTokens(userId, page, limit)
    const token = tokens.items.find(
      (token) => token.getTokenAddress() === address,
    )
    if (!token) throw new Error("Token not found")
    return token
  }

  async getAllTokenByAddress(
    userId: string,
    nameCategoryFilter: string | undefined,
    address: string,
  ): Promise<FT> {
    const tokens = await this.getAllTokens(userId, nameCategoryFilter)
    const token = tokens.find((token) => token.getTokenAddress() === address)
    if (!token) throw new Error("Token not found")
    return token
  }

  //todo move somewhere because contains NFT balance as well
  async getTotalUSDBalance(
    userId: string,
    userPublicKey: Principal,
  ): Promise<string | undefined> {
    let userTokens = await icrc1StorageService.getICRC1ActiveCanisters(userId)
    let ft = userTokens.map((token) => new FTImpl(token))
    await Promise.all(ft.map((ft) => ft.init(userPublicKey)))
    const [, nftPrice] = await Promise.all([
      Promise.all(ft.map((ft) => ft.getUSDBalanceFormatted())),
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
