import { Principal } from "@dfinity/principal"
import { restCall } from "@nfid/integration"

import { Balance } from "frontend/integration/rosetta/rosetta_interface"

import { getRosettaRequest } from "../get-rosetta-request"
import { rosetta } from "../index"
import { mapToBalance } from "./map-to-balance"

export async function getBalance(principal: Principal): Promise<Balance> {
  let request = getRosettaRequest(principal)
  return await restCall("POST", `${rosetta}/account/balance`, request).then(
    mapToBalance,
  )
}
