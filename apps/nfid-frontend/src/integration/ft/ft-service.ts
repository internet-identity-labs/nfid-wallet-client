import {PaginatedResponse} from "src/integration/nft/impl/nft-types";
import {FT} from "src/integration/ft/ft";
import {Principal} from "@dfinity/principal";
import {FTImpl} from "src/integration/ft/impl/ft-impl"
import {icrc1RegistryService} from "@nfid/integration/token/icrc1/icrc1-registry-service";
import {icrc1Service} from "@nfid/integration/token/icrc1/icrc1-service";
import {ICP_CANISTER_ID} from "@nfid/integration/token/constants";
import {State} from "@nfid/integration/token/icrc1/enums";
import BigNumber from "bignumber.js"

export class FtService {
  async getAllUserTokens(userPrincipal: Principal, page: number = 1, limit: number = 10): Promise<PaginatedResponse<FT>> {
    let userTokens = await icrc1Service.getICRC1ActiveCanisters(userPrincipal.toText());
    if (userTokens.length === 0) {
      await icrc1RegistryService.storeICRC1Canister(
        ICP_CANISTER_ID, State.Active)
      userTokens = await icrc1Service.getICRC1ActiveCanisters(userPrincipal.toText());
    }

    const ft: Array<FT> = userTokens.map((token) => new FTImpl(token));
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

  async getTotalUSDBalance(userPrincipal: Principal): Promise<string | undefined> {
    let userTokens = await icrc1Service.getICRC1ActiveCanisters(userPrincipal.toText());
    let ft = userTokens.map((token) => new FTImpl(token));
    await Promise.all(ft.map(ft => ft.init(userPrincipal)))
    await Promise.all(
      ft.map((ft) =>
         ft.getUSDBalance()
      )
    );
    console.log(ft)

    let a =  ft
      .map((ft) => ft.getUSDBalanceNumber())
      .filter((balance) => balance !== undefined)
      .reduce((acc: BigNumber, balance: BigNumber) => acc.plus(balance), BigNumber(0))
    return a.toFixed(2) + " USD"
  }

}

export const ftService = new FtService()
