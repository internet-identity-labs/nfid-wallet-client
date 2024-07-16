import { DelegationIdentity } from "@dfinity/identity"
import {
  TransactionRequest,
  TransactionResponse,
} from "@ethersproject/abstract-provider"
import { TypedMessage } from "@metamask/eth-sig-util"
import { Bytes } from "ethers"
import { ethers } from "ethers-ts"

import { alchemyService } from "../asset/service/alchemy.service"
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
    const [chainId, nonce, { gasPrice, maxPriorityFeePerGas, maxFeePerGas }] =
      await Promise.all([
        this.wallet.getChainId(),
        this.wallet.getTransactionCount("latest"),
        this.wallet.getFeeData(),
      ])

    if (!gasPrice || !maxPriorityFeePerGas || !maxFeePerGas) {
      throw Error("FeeData isn't available.")
    }

    delete (transaction as any)["gas"]

    tx = {
      ...transaction,
      nonce,
      maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
      maxFeePerGas: transaction.maxFeePerGas,
    }

    try {
      tx = await this.wallet.populateTransaction(transaction)
      tx.gasLimit = ethers.BigNumber.from(tx.gasLimit).mul(125).div(100)
      tx.gasPrice = gasPrice
      return [tx, err]
    } catch (error) {
      if ((error as any).code === "INSUFFICIENT_FUNDS") {
        err = ProviderError.INSUFICIENT_FUNDS
        const t = { ...transaction }
        t.from = "0xC48E23C5F6e1eA0BaEf6530734edC3968f79Af2e"

        gasLimit = await alchemyService.estimateGas(chainId, t)
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

      try {
        gasLimit = await alchemyService.estimateGas(chainId, transaction)

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
      } catch (error) {
        try {
          err = ProviderError.NETWORK_BUSY
          const t = { ...transaction }

          delete t.maxFeePerGas
          delete t.maxPriorityFeePerGas

          gasLimit = await alchemyService.estimateGas(chainId, t)
        } catch (error) {
          gasLimit = ethers.utils.parseEther("0.7").div(gasPrice)
        }
      }
    }

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
    delegation: DelegationIdentity,
    populatedTransaction?: [TransactionRequest, ProviderError | undefined],
  ): Promise<TransactionResponse> {
    this.wallet.replaceIdentity(delegation)
    const provider = this.getProvider()
    if (!provider) throw new Error("provider missing")
    this.wallet._checkProvider("sendTransaction")

    if (!populatedTransaction) throw new Error("No populated transaction")
    const [transaction, _] = populatedTransaction
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
