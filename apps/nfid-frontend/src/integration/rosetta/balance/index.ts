import { Principal } from "@dfinity/principal"
import { getRosettaRequest, restCall, rosetta } from "@nfid/integration"

import { Balance } from "frontend/integration/rosetta/rosetta_interface"

import { mapToBalance } from "./map-to-balance"

export async function getBalance(principal: Principal): Promise<Balance> {
  let request = getRosettaRequest(principal)
  return await restCall("POST", `${rosetta}/account/balance`, request).then(
    mapToBalance,
  )
}
