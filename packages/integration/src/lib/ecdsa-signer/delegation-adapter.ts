import { DelegationIdentity } from "@dfinity/identity"
import {
  TransactionRequest,
  TransactionResponse,
} from "@ethersproject/abstract-provider"
import { TypedMessage } from "@metamask/eth-sig-util"
import { BigNumber, Bytes } from "ethers"
import { ethers } from "ethers-ts"
import { Deferrable } from "ethers/lib/utils"

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
    transaction: TransactionRequest,
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
        const gasPrice = await provider.getGasPrice()
        // TODO: SC-6735 what to do with gasLimit?
        const gasLimit = BigNumber.from(100000)
        tx = {
          from: transaction.from,
          to: transaction.to,
          data: transaction.data,
          value: transaction.value,
          nonce: provider.getTransactionCount(
            transaction.from || "",
            "pending",
          ),
          gasLimit,
          gasPrice,
        }
        console.error("sendTransaction", { error })
      }
    }

    const signedTx = await this.signTransaction(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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

  // TODO: type the dude
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
