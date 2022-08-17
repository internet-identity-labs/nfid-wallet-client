import { Principal } from "@dfinity/principal"
import { principalToAddress, fromHexString } from "ictool"

import { ii, ledger, cyclesMinter } from "frontend/integration/actors"
import {
  Balance,
  RosettaRequest,
  TransactionHistory,
  XdrUsd,
} from "frontend/integration/rosetta/rosetta_interface"

import { TransferResult } from "../_ic_api/ledger.did"
import { mapToBalance, mapToTransactionHistory, mapToXdrUsd } from "./mapper"
import { restCall } from "./util"

const rosetta = "https://rosetta-api.internetcomputer.org"
const nfidDomain = "nfid.one"
const converter = `https://free.currconv.com/api/v7/convert?q=XDR_USD&compact=ultra&apiKey=2e7846fe12c845869fbb942bed2529d0`

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
): Promise<TransferResult> {
  return ledger
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
}

export async function getWalletPrincipal(anchor: number): Promise<Principal> {
  return ii.get_principal(BigInt(anchor), nfidDomain).catch((e) => {
    throw Error(`Getting of Wallet Principal failed!: ${e}`, e)
  })
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
