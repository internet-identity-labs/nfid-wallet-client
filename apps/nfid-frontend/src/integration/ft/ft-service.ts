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
    userId: string,
    userPublicKey: Principal,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<FT>> {
    let userTokens = await icrc1StorageService
      .getICRC1Canisters(userId)
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

    const ft: Array<FT> = userTokens.map((token) => new FTImpl(token))
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
        return canisters.map((canister) => {
          return new FTImpl(canister)
        })
      })
  }

  async getUserTokenByAddress(
    userId: string,
    userPublicKey: Principal,
    address: string,
  ): Promise<FT> {
    const tokens = await this.getAllUserTokens(userId, userPublicKey)
    const token = tokens.items.find(
      (token) => token.getTokenAddress() === address,
    )
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
