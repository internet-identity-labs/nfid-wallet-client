import { storageWithTtl } from "@nfid/client-db"

import { ICRC1 } from "../../../_ic_api/user_registry.d"
import { userRegistry } from "../../../actors"
import { authState } from "../../../authentication"
import { State } from "../enum/enums"
import { mapStateTS } from "../util"

const icrc1RegistryCacheName = "ICRC1RegistryService.getCanistersByRoot"

export class Icrc1RegistryService {
  private getCanistersByRootLock: Promise<void> | null = null

  public async getStoredUserTokens(): Promise<Array<ICRC1>> {
    const registryCacheName = await this.getRegistryCacheName()
    const cache = await storageWithTtl.getEvenExpired(registryCacheName)
    if (!cache) {
      const root = authState.getUserIdData().userId
      const response = await userRegistry.get_canisters_by_root(root)
      storageWithTtl.set(registryCacheName, JSON.stringify(response), 30 * 1000)
      return response
    } else if (cache && cache.expired && !this.getCanistersByRootLock) {
      const root = authState.getUserIdData().userId
      this.getCanistersByRootLock = userRegistry
        .get_canisters_by_root(root)
        .then((response) => {
          storageWithTtl.set(
            registryCacheName,
            JSON.stringify(response),
            30 * 1000,
          )
        })
        .finally(() => {
          this.getCanistersByRootLock = null
        })
      return JSON.parse(cache.value as string) as ICRC1[]
    } else {
      return JSON.parse(cache.value as string) as ICRC1[]
    }
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
    return `${icrc1RegistryCacheName}${userCache.anchor}`
  }
}

export const icrc1RegistryService = new Icrc1RegistryService()
