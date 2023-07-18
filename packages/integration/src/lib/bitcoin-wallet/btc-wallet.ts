import { DelegationIdentity } from "@dfinity/identity"
import { networks, payments, TransactionBuilder } from "bitcoinjs-lib"
import { Cache } from "node-ts-cache"

import { integrationCache } from "../../cache"
import { Chain, ecdsaSign, getPublicKey } from "../lambda/ecdsa"
import {
  bcComputeFee,
  bcComputeTransaction,
  bcPushTransaction,
} from "./blockcypher-adapter"
import { BlockCypherTx } from "./types"

export class BtcWallet {
  private readonly walletIdentity: DelegationIdentity
  private readonly isMainNet: boolean

  constructor(identity: DelegationIdentity, isMainNet?: boolean) {
    this.walletIdentity = identity
    if (typeof isMainNet === "undefined") {
      this.isMainNet = "mainnet" == CHAIN_NETWORK
    } else {
      this.isMainNet = isMainNet
    }
  }

  @Cache(integrationCache, { ttl: 3600 })
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
    const source = await this.getBitcoinAddress()
    const tx = await this.computeTransactionHex(source, satoshi, targetAddress)
    let signedTx
    try {
      signedTx = await ecdsaSign(tx, this.walletIdentity, Chain.BTC)
    } catch (e: any) {
      throw new Error("sendSatoshi: " + e.message)
    }
    return bcPushTransaction(signedTx)
  }

  async getFee(target: string, value: number): Promise<number> {
    const source = await this.getBitcoinAddress()
    return await bcComputeFee(source, target, value)
  }

  async computeTransactionHex(
    address: string,
    transactionValue: number,
    targetAddress: string,
  ) {
    const result: BlockCypherTx = await bcComputeTransaction(
      address,
      targetAddress,
      transactionValue,
    )
    const network =
      "mainnet" == CHAIN_NETWORK ? networks.bitcoin : networks.testnet
    const txb = new TransactionBuilder(network)
    result.tx.inputs.forEach((input: any) => {
      txb.addInput(input.prev_hash, input.output_index)
    })
    result.tx.outputs.forEach((output: any) => {
      txb.addOutput(output.addresses[0], output.value)
    })
    const builtTx = txb.buildIncomplete()
    return builtTx.toHex()
  }
}
