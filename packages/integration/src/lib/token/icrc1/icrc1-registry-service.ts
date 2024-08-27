import { ICRC1 } from "../../_ic_api/icrc1_registry.d"
import { iCRC1Registry } from "./../../actors"
import { State } from "./enums"
import { mapStateTS } from "./util"

export class Icrc1RegistryService {
  getCanistersByRoot(root: string): Promise<Array<ICRC1>> {
    return iCRC1Registry.get_canisters_by_root(root)
  }

  storeICRC1Canister(ledger: string, state: State): Promise<void> {
    return iCRC1Registry.store_icrc1_canister(ledger, mapStateTS(state))
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
