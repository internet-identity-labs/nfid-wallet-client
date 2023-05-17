import fetch from "node-fetch"

import { integrationCache } from "../../cache"
import {
  BlockCypherAddressFullResponse,
  BlockCypherAddressResponse,
  BlockCypherTx,
} from "./types"

const tokenBTC = BLOCK_CYPHER_TOKEN

const mainnet = "https://api.blockcypher.com/v1/btc/main"
const testnet = "https://api.blockcypher.com/v1/btc/test3"

export async function bcPushTransaction(signedTx: string) {
  return fetch(`${getUrl()}/txs/push`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tx: signedTx }),
  }).then(async (response) => {
    return await response.json()
  })
}

export async function bcTransactionInfo(
  address: string,
): Promise<BlockCypherAddressFullResponse> {
  const cachedNftConfig = (await integrationCache.getItem(
    "bcTransactionInfo",
  )) as BlockCypherAddressFullResponse
  if (cachedNftConfig) {
    return cachedNftConfig
  }
  const url = `${getUrl()}/addrs/${address}/full?token=${tokenBTC}`
  const response = await fetch(url)
  const result = await response.json()
  await integrationCache.setItem("bcTransactionInfo", result, {
    ttl: 120,
  })
  return result
}

export async function bcAddressInfo(
  address: string,
): Promise<BlockCypherAddressResponse> {
  const cachedNftConfig = (await integrationCache.getItem(
    "bcAddressInfo",
  )) as BlockCypherAddressResponse
  if (cachedNftConfig) {
    return cachedNftConfig
  }
  const url = `${getUrl()}/addrs/${address}?token=${tokenBTC}`
  const response = await fetch(url)
  const result = await response.json()
  await integrationCache.setItem("bcAddressInfo", result, {
    ttl: 120,
  })
  return result
}

export async function bcComputeFee(
  address: string,
  targetAddress: string,
  transactionValue: number,
) {
  return bcComputeTransaction(address, targetAddress, transactionValue).then(
    (l) => l.tx.fees,
  )
}

export async function bcComputeTransaction(
  address: string,
  targetAddress: string,
  transactionValue: number,
): Promise<BlockCypherTx> {
  const cacheKey = "bcComputeTransaction" + targetAddress + transactionValue
  const cachedNftConfig = await integrationCache.getItem(cacheKey)
  if (cachedNftConfig) {
    return cachedNftConfig as BlockCypherTx
  }
  const url = `${getUrl()}/txs/new?includeToSignTx=true?token=${tokenBTC}`
  const data = {
    inputs: [
      {
        addresses: [address],
      },
    ],
    outputs: [
      {
        addresses: [targetAddress],
        value: transactionValue,
      },
    ],
  }
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  const result = await response.json()
  await integrationCache.setItem(cacheKey, result, {
    ttl: 120,
  })
  return result
}

function getUrl(): string {
  let rootUrl
  if ("mainnet" == CHAIN_NETWORK) {
    rootUrl = mainnet
  } else {
    rootUrl = testnet
  }
  return rootUrl
}
