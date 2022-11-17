import { Principal } from "@dfinity/principal"

import { rosetta } from ".."
import { restCall } from "../../rest/rest-call"
import { getRosettaRequest } from "../get-rosetta-request"
import { mapToBalance } from "./map-to-balance"

export interface RosettaBalance {
  block_identifier: {
    index: number
    hash: string
  }
  balances: [Balance]
  metadata: {
    sequence_number: number
  }
}

export interface Balance {
  value: string
  currency: {
    symbol: string
    decimals: number
    metadata: {
      Issuer: string
    }
  }
  metadata: object
}

export async function getBalance(principal: Principal): Promise<Balance> {
  const request = getRosettaRequest(principal)
  return await restCall("POST", `${rosetta}/account/balance`, request).then(
    mapToBalance,
  )
}
