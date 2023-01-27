import { EthersEthereum } from "@rarible/ethers-ethereum"
import { createRaribleSdk } from "@rarible/sdk"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { IRaribleSdk } from "@rarible/sdk/build/domain"
import { ethers } from "ethers"

import { EthWallet } from "../ecdsa-signer/ecdsa-wallet"

export const raribleEnv = "testnet" //todo config?

export class RaribleBridge {
  private readonly ethWallet: EthWallet
  private readonly raribleSdk: IRaribleSdk

  constructor(provider: string) {
    const rpcProvider = new ethers.providers.JsonRpcProvider(provider)
    this.ethWallet = new EthWallet(rpcProvider)
    const ethersWallet = new EthereumWallet(new EthersEthereum(this.ethWallet))
    this.raribleSdk = createRaribleSdk(ethersWallet, raribleEnv)
  }

  sdk() {
    return this.raribleSdk
  }

  ethersWallet() {
    return this.ethWallet
  }
}
