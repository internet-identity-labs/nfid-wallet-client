import { Principal } from "@dfinity/principal"
import { principalToAddress, fromHexString } from "ictool"
import { IcpXdrConversionResponse } from "frontend/integration/_ic_api/progenitus.did"
import { ii, ledger, progenitus } from "frontend/integration/actors"
import {
  Balance,
  RosettaBalance,
  RosettaRequest,
  XdrUsd,
} from "frontend/integration/rosetta/rosetta_interface"

//todo move to env variables
const rosetta = "https://rosetta-api.internetcomputer.org"
const nfidDomain = "nfid.dev"
const converter =
  "https://free.currconv.com/api/v7/convert?q=XDR_USD&compact=ultra&apiKey=df6440fc0578491bb13eb2088c4f60c7"

export async function getBalance(principal: Principal): Promise<Balance> {
  let request: RosettaRequest = getRosettaRequest(principal)
  return await restCall("POST", `${rosetta}/account/balance`, request).then(
    mapToBalance,
  )
}

export async function getTransactionHistory(
  principal: Principal,
): Promise<any> {
  let request: RosettaRequest = getRosettaRequest(principal)
  return await restCall("POST", `${rosetta}/search/transactions`, request).then(
    mapToTransactionHistory,
  )
}

export async function getExchangeRate(): Promise<number> {
  let xdrToIcp = await progenitus
    .get_icp_xdr_conversion_rate()
    .then((x) => x as IcpXdrConversionResponse)
    .then((x) => x.data.xdr_permyriad_per_icp)
  let xdrToUsd: XdrUsd = await restCall("GET", converter).then(mapToXdrUsd)
  return (parseFloat(xdrToUsd.XDR_USD) * Number(xdrToIcp)) / 10000
}

//todo not properly tested. blocked by e2e
export async function transfer(amount: number, to: string) {
  return ledger.transfer({
    to: fromHexString(to),
    amount: { e8s: BigInt(amount.toFixed()) },
    memo: BigInt(0),
    fee: { e8s: BigInt(10_000) },
    from_subaccount: [],
    created_at_time: [],
  }).catch(e => {
    throw Error(`Transfer failed!: ${e}`, e)
  })
}

export async function getWalletPrincipal(anchor: number) {
  return await ii.get_principal(BigInt(anchor), nfidDomain)
}

async function restCall<T>(
  method: string,
  url: string,
  request?: T,
): Promise<Response> {
  let metadata = {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
  }

  if (request) {
    metadata = { ...metadata, ...{ body: JSON.stringify(request) } }
  }

  return await fetch(url, metadata)
    .then(async (response: Response) => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      return response
    })
    .catch((e: Error) => {
      throw e
    })
}

async function mapToXdrUsd(response: Response): Promise<XdrUsd> {
  return response.json().then((data) => data as XdrUsd)
}

async function mapToTransactionHistory(response: Response): Promise<any> {
  return await response.json().then((data) => data)
}

async function mapToBalance(response: Response): Promise<Balance> {
  return await response
    .json()
    .then((data) => data as RosettaBalance)
    .then((balance: RosettaBalance) => balance.balances[0])
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
