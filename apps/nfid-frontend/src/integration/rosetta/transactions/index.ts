import { Principal } from "@dfinity/principal"

import { TransactionHistory } from "frontend/integration/rosetta/rosetta_interface"

import { getRosettaRequest } from "../get-rosetta-request"
import { rosetta } from "../index"
import { restCall } from "../util"
import { mapToTransactionHistory } from "./map-to-transaction-history"

export async function getTransactionHistory(
  principal: Principal,
): Promise<TransactionHistory> {
  let request = getRosettaRequest(principal)
  return await restCall("POST", `${rosetta}/search/transactions`, request).then(
    mapToTransactionHistory,
  )
}
