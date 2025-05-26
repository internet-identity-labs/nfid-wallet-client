import { State } from "../enum/enums"
import { ICRC1 as ICRC1UserData } from "../types"
import { mapCategory, mapState } from "../util"
import { icrc1OracleService } from "./icrc1-oracle-service"
import { icrc1RegistryService } from "./icrc1-registry-service"

export class Icrc1StorageService {
  async getICRC1ActiveCanisters(
    principal: string,
  ): Promise<Array<ICRC1UserData>> {
    return this.getICRC1Canisters(principal).then((canisters) => {
      return canisters.filter((c) => c.state === State.Active)
    })
  }

  async getICRC1FilteredCanisters(
    principal: string,
    filterText: string | undefined,
  ): Promise<Array<ICRC1UserData>> {
    return this.getICRC1Canisters(principal).then((canisters) => {
      if (!filterText) {
        return canisters
      }
      return canisters.filter(
        (c) =>
          c.name.toLowerCase().includes(filterText.toLowerCase()) ||
          c.symbol.toLowerCase().includes(filterText.toLowerCase()),
      )
    })
  }

  async getICRC1Canisters(principal: string): Promise<Array<ICRC1UserData>> {
    const [icrc1StateData, icrc1OracleData] = await Promise.all([
      icrc1RegistryService.getCanistersByRoot(principal),
      icrc1OracleService.getICRC1Canisters(),
    ])
    return icrc1OracleData.map((icrc1) => {
      const registry = icrc1StateData.find(
        (state) => state.ledger === icrc1.ledger,
      )
      //todo maybe group metadata
      const userData: ICRC1UserData = {
        decimals: icrc1.decimals,
        fee: icrc1.fee,
        ledger: icrc1.ledger,
        name: icrc1.name,
        symbol: icrc1.symbol,
        logo: icrc1.logo[0],
        index: icrc1.index[0],
        rootCanisterId: icrc1.root_canister_id[0],
        state:
          registry === undefined ? State.Inactive : mapState(registry.state),
        category: mapCategory(icrc1.category),
        isNativeBtc: false,
      }
      return userData
    })
  }
}

export const icrc1StorageService = new Icrc1StorageService()
