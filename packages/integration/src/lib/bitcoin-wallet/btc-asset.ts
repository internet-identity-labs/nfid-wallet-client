import { DelegationIdentity } from "@dfinity/identity"
import { toBn } from "@rarible/utils"
import BigNumber from "bignumber.js"
import { format } from "date-fns"
import { principalToAddress } from "ictool"

import { E8S } from "@nfid/integration/token/icp"

import { Asset } from "../asset/asset"
import { getPrice } from "../asset/asset-util"
import {
  ChainBalance,
  FungibleActivityRecord,
  FungibleActivityRecords,
  FungibleActivityRequest,
  FungibleTransactionRequest,
  FungibleTxs,
  Token,
  TokenBalanceSheet,
  TokenPrice,
  TransactionRow,
} from "../asset/types"
import { BtcWallet } from "./btc-wallet"

export const mainnet = "https://mempool.space/api/address/"
export const testnet = "https://mempool.space/testnet/api/address/"

export class BtcAsset extends Asset<string> {
  getAddress(identity: DelegationIdentity): Promise<string> {
    return new BtcWallet(identity).getBitcoinAddress()
  }

  getBalance(
    address: string | undefined,
    delegation: DelegationIdentity | undefined,
  ): Promise<ChainBalance> {
    throw new Error("Method not implemented.")
  }

  getBlockchain(): string {
    return "Bitcoin"
  }

  async transfer(
    identity: DelegationIdentity,
    request: FungibleTransactionRequest,
  ): Promise<string> {
    try {
      const satoshi = BigNumber(request.amount).multipliedBy(E8S).toNumber()
      const response = await new BtcWallet(identity).sendSatoshi(
        request.to,
        satoshi,
      )
      return `You've sent ${request.amount} BTC. Transaction hash: ${response.tx.hash}`
    } catch (e: any) {
      throw new Error(
        e?.message ??
          "Unexpected error: The BTC transaction has been cancelled",
      )
    }
  }

  async getRootAccount(
    delegation?: DelegationIdentity,
    logo?: string,
  ): Promise<TokenBalanceSheet> {
    if (!delegation) {
      throw Error("Give me delegation. It's cached!")
    }
    let url = "mainnet" == CHAIN_NETWORK ? mainnet : testnet
    const wallet = new BtcWallet(delegation)
    const address: string = await wallet.getBitcoinAddress()
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
    const token: Token = {
      address: address,
      balance: this.toDenomination(balanceBN.toString()),
      balanceinUsd: "$" + (balanceinUsd?.toFixed(2) ?? "0.00"),
      logo,
      name: this.getBlockchain(),
      symbol: "BTC",
    }
    const fee = await wallet.getFee()
    return super.computeSheetForRootAccount(
      token,
      delegation.getPrincipal().toText(),
      logo,
      fee.toString(),
    )
  }

  async getTransactionHistory(
    identity: DelegationIdentity,
  ): Promise<FungibleTxs> {
    const address = await new BtcWallet(identity).getBitcoinAddress()
    const sendTransactions = await this.getTransactions("send", address)
    const receivedTransactions = await this.getTransactions("received", address)
    const addressPrincipal = principalToAddress(identity.getPrincipal())
    return {
      sendTransactions,
      receivedTransactions,
      walletAddress: addressPrincipal,
      btcAddress: address,
    }
  }

  private async getTransactions(
    type: string,
    address: string,
  ): Promise<TransactionRow[]> {
    return await new BtcAsset()
      .getFungibleActivityByTokenAndUser({
        address,
        direction: type === "send" ? "from" : "to",
      })
      .then((tss) => {
        return tss.activities
          .map((tx) => {
            tx.asset = "BTC"
            return tx
          })
          .map((tx) => this.toTransactionRow(tx, address))
      })
  }

  protected override formatDate(date: string): string {
    return format(new Date(Number(date) * 1000), "MMM dd, yyyy - hh:mm:ss aaa")
  }

  protected override formatPrice(price: number) {
    return Number(price) / E8S
  }

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
  }
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

export const btcAsset = new BtcAsset()
