import { Principal } from "@dfinity/principal"
import { getRosettaRequest, restCall, rosetta } from "@nfid/integration"
import { principalToAddress } from "ictool"

import { TransactionHistory } from "frontend/integration/rosetta/rosetta_interface"

import { mapToTransactionHistory } from "./map-to-transaction-history"

export async function getTransactionHistory(
  principal: Principal,
): Promise<TransactionHistory> {
  let request = getRosettaRequest(principalToAddress(principal))
  return await restCall("POST", `${rosetta}/search/transactions`, request).then(
    mapToTransactionHistory,
  )
}
