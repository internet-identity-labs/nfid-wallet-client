import { DelegationIdentity } from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { principalToAddress, fromHexString } from "ictool"

import { cyclesMinter, ledgerWithIdentity } from "frontend/integration/actors"
import {
  Balance,
  RosettaRequest,
  TransactionHistory,
  XdrUsd,
} from "frontend/integration/rosetta/rosetta_interface"

import { BlockIndex, TransferResult } from "../_ic_api/ledger.did"
import { mapToBalance, mapToTransactionHistory, mapToXdrUsd } from "./mapper"
import { restCall } from "./util"

declare const CURRCONV_TOKEN: string

const rosetta = "https://rosetta-api.internetcomputer.org"
export const WALLET_SCOPE = "nfid.one"
const converter = `https://free.currconv.com/api/v7/convert?q=XDR_USD&compact=ultra&apiKey=${
  CURRCONV_TOKEN ?? "***REMOVED***"
}`

export async function getBalance(principal: Principal): Promise<Balance> {
  let request: RosettaRequest = getRosettaRequest(principal)
  return await restCall("POST", `${rosetta}/account/balance`, request).then(
    mapToBalance,
  )
}

export async function getTransactionHistory(
  principal: Principal,
): Promise<TransactionHistory> {
  let request: RosettaRequest = getRosettaRequest(principal)
  return await restCall("POST", `${rosetta}/search/transactions`, request).then(
    mapToTransactionHistory,
  )
}

export async function getExchangeRate(): Promise<number> {
  let xdrToIcp = await cyclesMinter
    .get_icp_xdr_conversion_rate()
    .then((x) => x.data.xdr_permyriad_per_icp)
    .catch((e) => {
      throw Error(`CyclesMinter failed!: ${e}`, e)
    })
  let xdrToUsd: XdrUsd = await restCall("GET", converter)
    .then(mapToXdrUsd)
    .catch((e) => {
      throw Error(`free.currconv.com failed!: ${e}`, e)
    })
  return (parseFloat(xdrToUsd.XDR_USD) * Number(xdrToIcp)) / 10000
}

//todo not properly tested. blocked by e2e
export async function transfer(
  amount: number,
  to: string,
  identity: DelegationIdentity,
): Promise<BlockIndex> {
  const ledgerWithWallet = ledgerWithIdentity(identity)

  const result: TransferResult = await ledgerWithWallet
    .transfer({
      to: fromHexString(to),
      amount: { e8s: BigInt(amount.toFixed()) },
      memo: BigInt(0),
      fee: { e8s: BigInt(10_000) },
      from_subaccount: [],
      created_at_time: [],
    })
    .catch((e) => {
      throw Error(`Transfer failed!: ${e}`, e)
    })

  if ("Err" in result) throw Error(Object.keys(result.Err)[0])
  return result.Ok
}

function getRosettaRequest(principal: Principal): RosettaRequest {
  let address: string = principalToAddress(principal as any)
  return {
    network_identifier: {
      blockchain: "Internet Computer",
      network: "00000000000000020101",
    },
    account_identifier: {
      address: address,
    },
  }
}
