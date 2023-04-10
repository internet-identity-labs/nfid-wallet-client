import { DelegationIdentity } from "@dfinity/identity"
import { networks, payments, TransactionBuilder } from "bitcoinjs-lib"
import fetch from "node-fetch"

import { Chain, getPublicKey, signECDSA } from "../lambda/ecdsa"
import { BlockCypherTx } from "./types"

const mainnet = "https://api.blockcypher.com/v1/btc/main"
const testnet = "https://api.blockcypher.com/v1/btc/test3"
const fee = 1500
export class BtcWallet {
  private readonly walletIdentity: DelegationIdentity

  constructor(identity: DelegationIdentity) {
    this.walletIdentity = identity
  }

  async getBitcoinAddress(): Promise<string> {
    const publicKey = await getPublicKey(this.walletIdentity, Chain.BTC)
    const network =
      "mainnet" == CHAIN_NETWORK ? networks.bitcoin : networks.testnet
    const { address } = payments.p2pkh({
      pubkey: Buffer.from(publicKey, "hex"),
      network,
    })
    if (!address) {
      throw new Error(`getBitcoinAddress: not able to calculate`)
    }
    return address
  }

  async sendSatoshi(
    targetAddress: string,
    satoshi: number,
  ): Promise<BlockCypherTx> {
    const url = "mainnet" == CHAIN_NETWORK ? mainnet : testnet
    const source = await this.getBitcoinAddress()
    const tx = await this.computeTransaction(source, satoshi, targetAddress)
    const signedTx = await signECDSA(tx.toHex(), this.walletIdentity, Chain.BTC)

    return fetch(url + "/txs/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tx: signedTx }),
    }).then(async (response) => {
      return response.json()
    })
  }

  async computeTransaction(
    address: string,
    transactionValue: number,
    targetAddress: string,
  ) {
    const net = "mainnet" == CHAIN_NETWORK ? "" : "testnet"

    // Get all UTXOs for the given address
    const utxoUrl = `https://mempool.space/${net}/api/address/${address}/utxo`
    const utxoResponse = await fetch(utxoUrl)
    const utxos = await utxoResponse.json()

    // Get all transactions in the mempool for the given address
    const mempoolUrl = `https://mempool.space/${net}/api/address/${address}/txs/mempool`
    const mempoolResponse = await fetch(mempoolUrl)
    const mempoolTransactions = await mempoolResponse.json()

    // Find UTXOs not in the mempool
    const nonMempoolUtxos = utxos.filter((utxo: any) => {
      for (const tx of mempoolTransactions) {
        if (utxo.txid === tx.txid && utxo.vout === tx.vout) {
          return false
        }
      }
      return true
    })

    const network =
      "mainnet" == CHAIN_NETWORK ? networks.bitcoin : networks.testnet
    const txb = new TransactionBuilder(network)
    nonMempoolUtxos.sort((a: any, b: any) => a.value - b.value)
    let inputTotal = 0
    for (let i = 0; i < nonMempoolUtxos.length; i++) {
      const utxo = nonMempoolUtxos[i]
      txb.addInput(utxo.txid, utxo.vout)
      inputTotal += utxo.value
      if (inputTotal >= transactionValue) {
        break
      }
    }
    if (inputTotal < transactionValue) {
      throw new Error(`BTC insufficient funds`)
    }
    txb.addOutput(targetAddress, transactionValue)
    if (inputTotal > transactionValue + fee) {
      txb.addOutput(address, inputTotal - transactionValue - fee)
    }
    return txb.buildIncomplete()
  }
}
