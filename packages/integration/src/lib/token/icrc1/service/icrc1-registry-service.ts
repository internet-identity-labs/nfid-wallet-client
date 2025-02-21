import { storageWithTtl } from "@nfid/client-db"

import { ICRC1 } from "../../../_ic_api/icrc1_registry.d"
import { iCRC1Registry } from "../../../actors"
import { authState } from "../../../authentication"
import { State } from "../enum/enums"
import { mapStateTS } from "../util"

const icrc1RegistryCacheName = "ICRC1RegistryService.getCanistersByRoot"

export class Icrc1RegistryService {
  async getCanistersByRoot(root: string): Promise<Array<ICRC1>> {
    const registryCacheName = await this.getRegistryCacheName()
    const cache = await storageWithTtl.getEvenExpired(registryCacheName)
    if (!cache) {
      const response = await iCRC1Registry.get_canisters_by_root(root)
      storageWithTtl.set(registryCacheName, JSON.stringify(response), 30 * 1000)
      return response
    } else if (cache && cache.expired) {
      iCRC1Registry.get_canisters_by_root(root).then((response) => {
        storageWithTtl.set(
          registryCacheName,
          JSON.stringify(response),
          30 * 1000,
        )
      })
      return JSON.parse(cache.value as string) as ICRC1[]
    } else {
      return JSON.parse(cache.value as string) as ICRC1[]
    }
  }

  async storeICRC1Canister(ledger: string, state: State): Promise<void> {
    await Promise.all([
      iCRC1Registry.store_icrc1_canister(ledger, mapStateTS(state)),
      storageWithTtl.remove(await this.getRegistryCacheName()),
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
    const userCache = authState.getUserIdData()
    return `${icrc1RegistryCacheName}${userCache.anchor}`
  }
}

export const icrc1RegistryService = new Icrc1RegistryService()
