import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"
import { FT } from "src/integration/ft/ft"
import { FTImpl } from "src/integration/ft/impl/ft-impl"
import { PaginatedResponse } from "src/integration/nft/impl/nft-types"
import { nftService } from "src/integration/nft/nft-service"

import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"
import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { icrc1RegistryService } from "@nfid/integration/token/icrc1/service/icrc1-registry-service"
import { icrc1StorageService } from "@nfid/integration/token/icrc1/service/icrc1-storage-service"

export class FtService {
  async getAllUserTokens(
    userPrincipal: Principal,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<FT>> {
    let userTokens = await icrc1StorageService.getICRC1ActiveCanisters(
      userPrincipal.toText(),
    )
    if (userTokens.length === 0) {
      await icrc1RegistryService.storeICRC1Canister(
        ICP_CANISTER_ID,
        State.Active,
      )
      userTokens = await icrc1StorageService.getICRC1ActiveCanisters(
        userPrincipal.toText(),
      )
    }

    const ft: Array<FT> = userTokens.map((token) => new FTImpl(token))
    const totalItems = ft.length
    const totalPages = Math.ceil(totalItems / limit)

    const startIndex = (page - 1) * limit
    const endIndex = Math.min(startIndex + limit, totalItems)

    const items = ft.slice(startIndex, endIndex)
    await Promise.all(items.map((item) => item.init(userPrincipal)))

    return {
      items,
      currentPage: page,
      totalPages,
      totalItems,
    }
  }

  async getAllFTokens(
    principal: Principal,
    nameCategoryFilter: string | undefined,
  ): Promise<Array<FT>> {
    return icrc1StorageService
      .getICRC1FilteredCanisters(principal.toText(), nameCategoryFilter)
      .then((canisters) => {
        return canisters.map((canister) => {
          return new FTImpl(canister)
        })
      })
  }

  //todo move somewhere because contains NFT balance as well
  async getTotalUSDBalance(
    userPrincipal: Principal,
  ): Promise<string | undefined> {
    let userTokens = await icrc1StorageService.getICRC1ActiveCanisters(
      userPrincipal.toText(),
    )
    let ft = userTokens.map((token) => new FTImpl(token))
    await Promise.all(ft.map((ft) => ft.init(userPrincipal)))
    const [_, nftPrice] = await Promise.all([
      Promise.all(ft.map((ft) => ft.getUSDBalanceFormatted())),
      nftService.getNFTsTotalPrice(userPrincipal),
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
