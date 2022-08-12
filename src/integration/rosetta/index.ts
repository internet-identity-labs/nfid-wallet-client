import { Balance, RosettaBalance, XdrUsd } from "frontend/integration/rosetta/rosetta_interface"
import { principalToAddress } from "ictool"
import { Principal } from "@dfinity/principal"
import { ledger, progenitus } from "frontend/integration/actors"
import { IcpXdrConversionResponse } from "frontend/integration/_ic_api/progenitus.did"

const rosetta = "https://rosetta-api.internetcomputer.org"
const converter = "https://free.currconv.com/api/v7/convert?q=XDR_USD&compact=ultra&apiKey=df6440fc0578491bb13eb2088c4f60c7"

export async function getBalance(principal: Principal): Promise<Balance> {
  let request = rosettaData(principalToAddress(principal as any))
  return await fetch(`${rosetta}/account/balance`, {
    method: "POST",
    body: JSON.stringify(request),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(async (response: Response) => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      const balance: RosettaBalance = await response.json().then(data => data as RosettaBalance)

      return balance.balances[0]
    })
}

export async function getTransactionHistory(principal: Principal): Promise<any> {
  let request = rosettaData(principalToAddress(principal as any))
  return await fetch(`${rosetta}/search/transactions`, {
    method: "POST",
    body: JSON.stringify(request),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(async (response: Response) => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      const transactions = await response.json().then(data => data) //todo mapping

      return transactions
    })
}

export async function transfer() {//todo
  return (await ledger.symbol())
}

export async function exchangeRate() {
  let icpXdrConversionResponse = (await progenitus.get_icp_xdr_conversion_rate()) as IcpXdrConversionResponse
  let xdrRate = icpXdrConversionResponse.data.xdr_permyriad_per_icp
  let xdrToUsd = await fetch(converter, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(async (response: Response) => {
      if (!response.ok) {
        throw Error(response.statusText)
      }

      return response.json().then(data => data as XdrUsd)
    })
  return parseFloat(xdrToUsd.XDR_USD) * Number(xdrRate) / 10000
}

function rosettaData(account: string) {
  return {
    network_identifier: {
      blockchain: "Internet Computer",
      network: "00000000000000020101",
    },
    account_identifier: {
      address: account,
    },
  }
}
