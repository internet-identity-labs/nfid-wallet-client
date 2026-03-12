import { storageWithTtl, ttlCacheService } from "@nfid/client-db"

import { ICRC1 } from "../../../_ic_api/user_registry.d"
import { userRegistry } from "../../../actors"
import { authState } from "../../../authentication"
import { State } from "../enum/enums"
import { mapStateTS } from "../util"

export const ICRC1_REGISTRY_CACHE_NAME =
  "ICRC1RegistryService.getCanistersByRoot"

export class Icrc1RegistryService {
  public async getStoredUserTokens(): Promise<Array<ICRC1>> {
    const registryCacheName = await this.getRegistryCacheName()
    return ttlCacheService.getOrFetch(
      registryCacheName,
      () =>
        userRegistry.get_canisters_by_root(authState.getUserIdData().userId),
      30 * 1000,
      {
        serialize: JSON.stringify,
        deserialize: (v) => JSON.parse(v as string) as ICRC1[],
      },
    )
  }

  async storeICRC1Canister(
    ledger: string,
    state: State,
    network?: number,
  ): Promise<void> {
    await Promise.all([
      userRegistry.store_icrc1_canister(
        ledger,
        mapStateTS(state),
        network ? [network] : [],
      ),
      storageWithTtl.remove(await this.getRegistryCacheName()),
    ])
  }

  async removeICRC1Canister(
    principal: string,
    ledgerCanisterId: string,
  ): Promise<void> {
    const allUsersCanisters =
      await userRegistry.get_canisters_by_root(principal)
    if (!allUsersCanisters.map((c) => c.ledger).includes(ledgerCanisterId)) {
      throw new Error("Canister not found.")
    }
    await userRegistry.remove_icrc1_canister(ledgerCanisterId)
  }

  async getRegistryCacheName(): Promise<string> {
    const userCache = authState.getUserIdData()
    return `${ICRC1_REGISTRY_CACHE_NAME}${userCache.anchor}`
  }
}

export const icrc1RegistryService = new Icrc1RegistryService()
