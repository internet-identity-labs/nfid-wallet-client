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

export class FtService {
  async getAllUserTokens(
    userId: string,
    userPublicKey: Principal,
    page: number = 1,
    limit: number = 10,
    sortField: keyof FT = "getTokenName",
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

    ft.sort((a, b) => {
      // @ts-ignore
      const aValue = a[sortField]()
      // @ts-ignore
      const bValue = b[sortField]()

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue)
      } else {
        return 0
      }
    })

    const totalItems = ft.length
    const totalPages = Math.ceil(totalItems / limit)

    const startIndex = (page - 1) * limit
    const endIndex = Math.min(startIndex + limit, totalItems)

    const items = ft.slice(startIndex, endIndex)
    await Promise.all(items.map((item) => item.init(userPublicKey)))

    return {
      items,
      currentPage: page,
      totalPages,
      totalItems,
    }
  }

  async getAllFTokens(
    userId: string,
    nameCategoryFilter: string | undefined,
  ): Promise<Array<FT>> {
    return icrc1StorageService
      .getICRC1FilteredCanisters(userId, nameCategoryFilter)
      .then((canisters) => {
        const ft = canisters.map((canister) => new FTImpl(canister))

        const categoryOrder: Record<Category, number> = {
          [Category.Sns]: 3,
          [Category.ChainFusion]: 2,
          [Category.Known]: 4,
          [Category.Native]: 1,
          [Category.Community]: 5,
          [Category.Spam]: 7,
          [Category.ChainFusionTestnet]: 6,
        }

        ft.sort((a, b) => {
          const aCategory = categoryOrder[a.getTokenCategory()] || 999
          const bCategory = categoryOrder[b.getTokenCategory()] || 999
          return aCategory - bCategory
        })
        return ft
      })
  }

  //todo move somewhere because contains NFT balance as well
  async getTotalUSDBalance(
    userId: string,
    userPublicKey: Principal,
  ): Promise<string | undefined> {
    let userTokens = await icrc1StorageService.getICRC1ActiveCanisters(userId)
    let ft = userTokens.map((token) => new FTImpl(token))
    await Promise.all(ft.map((ft) => ft.init(userPublicKey)))
    const [_, nftPrice] = await Promise.all([
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
    return price.toFixed(2) + " USD"
  }
}

export const ftService = new FtService()
