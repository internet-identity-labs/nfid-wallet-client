import { DelegationIdentity } from "@dfinity/identity"
import { networks, payments, TransactionBuilder } from "bitcoinjs-lib"
import fetch from "node-fetch"

import { Chain, getPublicKey } from "../lambda/ecdsa"
import { BlockCypherTx } from "./types"

const mainnet = "https://api.blockcypher.com/v1/btc/main/txs/push"
const testnet = "https://api.blockcypher.com/v1/btc/test3/txs/push"

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
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tx,
      }),
    }).then(async (response) => {
      if (!response.ok) throw new Error(await response.text())
      return response.json()
    })
  }

  async computeTransaction(
    address: string,
    transactionValue: number,
    targetAddress: string,
  ) {
    const url = "mainnet" == CHAIN_NETWORK ? mainnet : testnet
    const response = await fetch(url)
    const json = await response.json()
    const inputs = json.txs.map((tx: any) => ({
      txid: tx.hash,
      vout: tx.outputs.findIndex((output: any) =>
        output.addresses.includes(address),
      ),
      value: tx.outputs.find((output: any) =>
        output.addresses.includes(address),
      ).value,
    }))
    const txb = new TransactionBuilder(networks.testnet)
    inputs.sort((a: any, b: any) => b.value - a.value) // sort inputs by value, highest to lowest
    let inputTotal = 0
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i]
      txb.addInput(input.txid, input.vout)
      inputTotal += input.value
      if (inputTotal >= transactionValue) {
        break // stop adding inputs once the transaction value is covered
      }
    }
    if (inputTotal < transactionValue) {
      throw new Error(`BTC insufficient funds`)
    }
    txb.addOutput(targetAddress, transactionValue)
    return txb
  }
}
