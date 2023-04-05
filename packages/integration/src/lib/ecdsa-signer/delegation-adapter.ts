import { DelegationIdentity } from "@dfinity/identity"
import {
  TransactionRequest,
  TransactionResponse,
} from "@ethersproject/abstract-provider"
import { TypedMessage } from "@metamask/eth-sig-util"
import { Alchemy, Network } from "alchemy-sdk"
import { Bytes } from "ethers"
import { ethers } from "ethers-ts"

import { EthWalletV2 } from "./signer-ecdsa"

export enum ProviderError {
  INSUFICIENT_FUNDS,
  NETWORK_BUSY,
}

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

  async populateTransaction(
    transaction: TransactionRequest,
    delegation: DelegationIdentity,
  ): Promise<[TransactionRequest, ProviderError | undefined]> {
    this.wallet.replaceIdentity(delegation)
    const provider = this.getProvider()
    if (!provider) throw new Error("provider missing")
    this.wallet._checkProvider("sendTransaction")

    let tx: TransactionRequest
    let err: ProviderError | undefined
    let gasLimit
    const gasPrice = await provider.getGasPrice()

    for (let index = 0; index <= 3; index++) {
      try {
        tx = await this.wallet.populateTransaction(transaction)
        return [tx, err]
      } catch (error) {
        const alchemy = new Alchemy({
          apiKey: ALCHEMY_API_KEY,
          network: Network.ETH_GOERLI,
        })
        try {
          gasLimit = await alchemy.core.estimateGas(transaction)
        } catch (error) {
          try {
            gasLimit = await alchemy.core.estimateGas({
              ...transaction,
              from: "0x0000000000000000000000000000000000000000",
              to: "0x0000000000000000000000000000000000000000",
            })
            err = ProviderError.INSUFICIENT_FUNDS
          } catch (error) {
            gasLimit = ethers.utils.parseEther("0.7").div(gasPrice)
            err = ProviderError.NETWORK_BUSY
          }
        }
      }
    }
    const nonce = await provider.getTransactionCount(
      transaction.from || "",
      "pending",
    )
    tx = {
      from: transaction.from,
      to: transaction.to,
      data: transaction.data,
      value: transaction.value,
      nonce,
      gasLimit,
      gasPrice,
    }
    return [tx, err]
  }

  async sendTransaction(
    [transaction, _]: [TransactionRequest, ProviderError | undefined],
    delegation: DelegationIdentity,
  ): Promise<TransactionResponse> {
    this.wallet.replaceIdentity(delegation)
    const provider = this.getProvider()
    if (!provider) throw new Error("provider missing")
    this.wallet._checkProvider("sendTransaction")
    const signedTx = await this.signTransaction(transaction, delegation)
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
