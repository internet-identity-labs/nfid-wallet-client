import { Balance, RosettaBalance } from "frontend/integration/rosetta/rosetta_interface"
import { principalToAddress } from "ictool"
import { Principal } from "@dfinity/principal"
import { ledger } from "frontend/integration/actors"

const rosetta = "https://rosetta-api.internetcomputer.org"

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

export async function transfer(){
  return (await ledger.symbol())
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
