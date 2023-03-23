import { DelegationIdentity } from "@dfinity/identity"
import {
  TransactionRequest,
  TransactionResponse,
} from "@ethersproject/abstract-provider"
import { Deferrable } from "@ethersproject/properties"
import { TypedMessage } from "@metamask/eth-sig-util"
import { Bytes } from "ethers"
import { ethers } from "ethers-ts"

import { EthWalletV2 } from "./signer-ecdsa"

export class DelegationWalletAdapter {
  private wallet: EthWalletV2

  constructor(url?: string) {
    this.wallet = new EthWalletV2()
    if (url) {
      this.connectProvider(url)
    }
  }

  connectProvider(url: string) {
    const rpcProvider = new ethers.providers.JsonRpcProvider(url)
    this.wallet.connect(rpcProvider)
  }

  getProvider() {
    return this.wallet.provider
  }

  async getAddress(walletDelegation: DelegationIdentity): Promise<string> {
    this.wallet.replaceIdentity(walletDelegation)
    return this.wallet.getAddress()
  }

  async sendTransaction(
    transaction: Deferrable<TransactionRequest>,
    delegation: DelegationIdentity,
  ): Promise<TransactionResponse> {
    this.wallet.replaceIdentity(delegation)
    const provider = this.getProvider()
    if (!provider) throw new Error("provider missing")
    this.wallet._checkProvider("sendTransaction")

    let tx
    for (let index = 0; index <= 3; index++) {
      try {
        tx = await this.wallet.populateTransaction(transaction)
      } catch (error) {
        console.error("sendTransaction", { error })
      }
    }
    const signedTx = await this.signTransaction(
      tx || (transaction as TransactionRequest),
      delegation,
    )
    return await provider.sendTransaction(signedTx)
  }

  async signMessage(
    message: Bytes | string,
    walletDelegation: DelegationIdentity,
  ): Promise<string> {
    this.wallet.replaceIdentity(walletDelegation)
    return this.wallet.signMessage(message)
  }

  async signTransaction(
    transaction: TransactionRequest,
    walletDelegation: DelegationIdentity,
  ): Promise<string> {
    this.wallet.replaceIdentity(walletDelegation)
    return this.wallet.signTransaction(transaction)
  }

  async signTypedData(
    { types, primaryType, domain, message }: TypedMessage<any>,
    walletDelegation: DelegationIdentity,
  ): Promise<string> {
    this.wallet.replaceIdentity(walletDelegation)
    return this.wallet.signTypedData({
      types,
      primaryType,
      domain,
      message,
    })
  }
}
