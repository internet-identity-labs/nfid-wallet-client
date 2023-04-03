import { DelegationIdentity } from "@dfinity/identity"
import { toBn } from "@rarible/utils"

import { getPrice } from "../asset/asset"
import {
  ChainBalance,
  FungibleActivityRecord,
  FungibleActivityRecords,
  FungibleActivityRequest,
  FungibleAsset,
  TokenPrice,
} from "../asset/types"
import { BtcWallet } from "./btc-wallet"

const mainnet = "https://mempool.space/api/address/"
const testnet = "https://mempool.space/testnet/api/address/"

export const BtcAsset: FungibleAsset = {
  async getBalance(walletAddress, delegation): Promise<ChainBalance> {
    let url = "mainnet" == CHAIN_NETWORK ? mainnet : testnet
    let address: string
    if (!walletAddress) {
      if (!delegation) throw new Error("Can not get BTC activity")
      address = await new BtcWallet(delegation).getBitcoinAddress()
    } else {
      address = walletAddress
    }
    url += `${address}`
    const response = await fetch(url)

    const json: MempoolAddressResponse = await response.json()

    // Calculate the account balance based on the funded and spent transaction outputs
    const funded = json.chain_stats.funded_txo_sum
    const spent = json.chain_stats.spent_txo_sum
    const balance = funded - spent

    let price: TokenPrice[]
    const balanceBN = toBn(balance * 0.00000001)
    try {
      price = await getPrice(["BTC"])
    } catch (e) {
      price = [{ price: "0.0", token: "BTC" }]
    }

    const balanceinUsd = toBn(price[0].price).multipliedBy(balanceBN)

    return { balance: balanceBN, balanceinUsd }
  },

  async getFungibleActivityByTokenAndUser(
    request: FungibleActivityRequest,
    delegation?: DelegationIdentity,
  ): Promise<FungibleActivityRecords> {
    const size = request.size ? request.size : Number.MAX_VALUE
    const activities: FungibleActivityRecord[] = []
    let cursor = request.cursor
    let address: string
    if (!request.address) {
      if (!delegation) throw new Error("Can not get BTC activity")
      address = await new BtcWallet(delegation).getBitcoinAddress()
    } else {
      address = request.address
    }
    let url = "mainnet" == CHAIN_NETWORK ? mainnet : testnet
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

      if (json.length === 0) {
        break
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
