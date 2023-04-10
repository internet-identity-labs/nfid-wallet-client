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
    const url = `https://mempool.space/${net}/api/address/${address}/utxo`
    const response = await fetch(url)
    const inputs = await response.json()
    const network =
      "mainnet" == CHAIN_NETWORK ? networks.bitcoin : networks.testnet
    const txb = new TransactionBuilder(network)
    inputs.sort((a: any, b: any) => a.value - b.value)
    let inputTotal = 0
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i]
      txb.addInput(input.txid, input.vout)
      inputTotal += input.value
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
