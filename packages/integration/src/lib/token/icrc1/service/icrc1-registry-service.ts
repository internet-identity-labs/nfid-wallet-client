import { ICRC1 } from "../../../_ic_api/icrc1_registry.d"
import { iCRC1Registry } from "../../../actors"
import { localStorageTTL } from "../../../util/local-strage-ttl"
import { State } from "../enum/enums"
import { mapStateTS } from "../util"

export const icrc1RegistryCacheName = "ICRC1RegistryService.getCanistersByRoot"

export class Icrc1RegistryService {
  async getCanistersByRoot(root: string): Promise<Array<ICRC1>> {
    const cache = localStorageTTL.getEvenExpiredItem(icrc1RegistryCacheName)
    if (!cache) {
      const response = await iCRC1Registry.get_canisters_by_root(root)
      localStorageTTL.setItem(icrc1RegistryCacheName, response, 30)
      return response
    } else if (cache && cache.expired) {
      iCRC1Registry.get_canisters_by_root(root).then((response) => {
        localStorageTTL.setItem(icrc1RegistryCacheName, response, 30)
      })
      return JSON.parse(cache.object)
    } else {
      return JSON.parse(cache.object)
    }
  }

  async storeICRC1Canister(ledger: string, state: State): Promise<void> {
    await iCRC1Registry.store_icrc1_canister(ledger, mapStateTS(state))
    localStorageTTL.removeItem(icrc1RegistryCacheName)
  }

  async removeICRC1Canister(
    principal: string,
    ledgerCanisterId: string,
  ): Promise<void> {
    const allUsersCanisters = await iCRC1Registry.get_canisters_by_root(
      principal,
    )
    if (!allUsersCanisters.map((c) => c.ledger).includes(ledgerCanisterId)) {
      throw new Error("Canister not found.")
    }
    await iCRC1Registry.remove_icrc1_canister(ledgerCanisterId)
  }
}

export const icrc1RegistryService = new Icrc1RegistryService()
