import {iCRC1} from "../actors"

export async function getICRC1Canisters(): Promise<Array<string>> {
  return iCRC1.get_canisters()
}

export async function addICRC1Canister(canisterId: string): Promise<void> {
  await iCRC1.add_icrc1_canister(canisterId)
}

