import { AccountIdentifier, LedgerCanister } from "@dfinity/ledger-icp"

import { rosetta } from ".."
import { restCall } from "../../rest/rest-call"
import { getRosettaRequest } from "../get-rosetta-request"
import { mapToBalance } from "./map-to-balance"

export type RosettaTokenBalance = {
  value: string
}

export interface RosettaBalance {
  block_identifier: {
    index: number
    hash: string
  }
  balances: [RosettaTokenBalance]
  metadata: {
    sequence_number: number
  }
}

export type Balance = bigint

export async function getBalance(address: string): Promise<Balance> {
  if (address.startsWith("0x")) {
    return Promise.resolve(BigInt(0))
  }
  return LedgerCanister.create().accountBalance({
    accountIdentifier: AccountIdentifier.fromHex(address),
    certified: false,
  })
}
