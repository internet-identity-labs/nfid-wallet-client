import { toBn } from "@rarible/utils"

import { getPrice } from "../asset/asset"
import {
  ChainBalance,
  FungibleActivityRecord,
  FungibleActivityRecords,
  FungibleActivityRequest,
  FungibleAsset,
} from "../asset/types"
import { BtcWallet } from "./btc-wallet"

const mainnet = "https://mempool.space/api/address/"
const testnet = "https://mempool.space/testnet/api/address/"

export const BtcAsset: FungibleAsset = {
  async getBalance(walletAddress): Promise<ChainBalance> {
    let url = "production" == FRONTEND_MODE ? mainnet : testnet
    const address = walletAddress
      ? walletAddress
      : await new BtcWallet().getBitcoinAddress()
    url += `${address}`
    console.debug("BTC_ASSET: " + url)
    const response = await fetch(url)
    console.debug("BTC_ASSET RESPONSE: " + JSON.stringify(response))

    const json: MempoolAddressResponse = await response.json()

    // Calculate the account balance based on the funded and spent transaction outputs
    const funded = json.chain_stats.funded_txo_sum
    const spent = json.chain_stats.spent_txo_sum
    const balance = funded - spent

    const balanceBN = toBn(balance * 0.00000001)

    console.debug("BTC_ASSET BALANCE: " + JSON.stringify(response))

    const price = await getPrice(["BTC"])
    const balanceinUsd = toBn(price[0].price).multipliedBy(balanceBN)

    console.debug("BTC_ASSET BALANCE in USD: " + JSON.stringify(response))

    return { balance: balanceBN, balanceinUsd }
  },

  async getFungibleActivityByTokenAndUser(
    request: FungibleActivityRequest,
  ): Promise<FungibleActivityRecords> {
    const size = request.size ? request.size : 10
    const activities: FungibleActivityRecord[] = []
    let cursor = request.cursor
    const address = request.address
      ? request.address
      : await new BtcWallet().getBitcoinAddress()
    let url = "production" == FRONTEND_MODE ? mainnet : testnet
    url += `${address}/txs`
    for (;;) {
      if (cursor) {
        url += `?last_seen_txid=${cursor}`
      }
      const response = await fetch(url)
      const json: MempoolTransactionResponse[] = await response.json()

      let records: FungibleActivityRecord[] = []

      if (request.direction === "to") {
        records = json
          .filter((tx) =>
            tx.vout.some((vout) => vout.scriptpubkey_address === address),
          )
          .map((tx) => {
            const from = tx.vout.find(
              (vout) => vout.scriptpubkey_address === address,
            )
            return {
              id: tx.txid,
              date: tx.status.block_time,
              to: address,
              from: tx.vin[0].prevout.scriptpubkey_address,
              transactionHash: tx.txid,
              price: from?.value ?? 0,
            }
          })
      }

      if (request.direction === "from") {
        records = json
          .filter((tx) =>
            tx.vin.some((vin) => vin.prevout.scriptpubkey_address === address),
          )
          .map((tx) => {
            const to = tx.vin.find(
              (vin) => vin.prevout.scriptpubkey_address === address,
            )
            return {
              id: tx.txid,
              date: tx.status.block_time,
              to: tx.vout[0].scriptpubkey_address,
              from: address,
              transactionHash: tx.txid,
              price: to?.prevout.value ?? 0,
            }
          })
      }

      if (records.length < size) {
        activities.push(...records)
        break
      }

      if (records.length >= size) {
        for (let i = 0; i < size; i++) {
          activities.push(records[i])
        }
        cursor = records[size - 1].transactionHash
        break
      }

      activities.push(...records)
      cursor = records[records.length - 1].transactionHash
    }

    return { activities, cursor }
  },
}

interface MempoolTransactionResponse {
  txid: string
  status: {
    block_time: string
  }
  vin: { prevout: { scriptpubkey_address: string; value: number } }[]
  vout: { scriptpubkey_address: string; value: number }[]
}

interface MempoolAddressResponse {
  chain_stats: {
    funded_txo_sum: number
    spent_txo_sum: number
    tx_count: number
  }
}
