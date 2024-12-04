import { ICRC1 } from "../../../_ic_api/icrc1_registry.d"
import { iCRC1Registry } from "../../../actors"
import { getUserIdData } from "../../../cache/cache"
import { idbStorageTTL } from "../../../util/idb-strage-ttl"
import { State } from "../enum/enums"
import { mapStateTS } from "../util"

const icrc1RegistryCacheName = "ICRC1RegistryService.getCanistersByRoot"

export class Icrc1RegistryService {
  async getCanistersByRoot(root: string): Promise<Array<ICRC1>> {
    const cache = await idbStorageTTL.getEvenExpiredItem(
      await this.getRegistryCacheName(),
    )
    if (!cache) {
      const response = await iCRC1Registry.get_canisters_by_root(root)
      await idbStorageTTL.setItem(
        await this.getRegistryCacheName(),
        JSON.stringify(response),
        30,
      )
      return response
    } else if (cache && cache.expired) {
      const registryCache = await this.getRegistryCacheName()
      await iCRC1Registry.get_canisters_by_root(root).then((response) => {
        idbStorageTTL.setItem(registryCache, JSON.stringify(response), 30)
      })
      return JSON.parse(cache.object)
    } else {
      return JSON.parse(cache.object)
    }
  }

  async storeICRC1Canister(ledger: string, state: State): Promise<void> {
    await Promise.all([
      iCRC1Registry.store_icrc1_canister(ledger, mapStateTS(state)),
      idbStorageTTL.removeItem(await this.getRegistryCacheName()),
    ])
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

  async getRegistryCacheName(): Promise<string> {
    const userCache = await getUserIdData()
    return `${icrc1RegistryCacheName}${userCache.anchor}`
  }
}

export const icrc1RegistryService = new Icrc1RegistryService()
