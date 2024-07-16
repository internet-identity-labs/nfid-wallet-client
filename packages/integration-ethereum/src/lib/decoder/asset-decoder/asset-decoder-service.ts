import { EthersEthereum } from "@rarible/ethers-ethereum"
import { ethers } from "ethers"

import { AssetId } from "./asset-decoder"

const ethereum = new EthersEthereum(ethers.Wallet.createRandom())

export enum AssetType {
  ERC721 = "0x73ad2146",
  ERC721_LAZY = "0xd8f960c1",
  ERC1155 = "0x973bb640",
  ERC1155_LAZY = "0x1cdfaa40",
}

export class AssetDecoderService {
  private ethereum: EthersEthereum

  constructor(ethereum: EthersEthereum) {
    this.ethereum = ethereum
  }

  map(abi: object, data: string): AssetId {
    const result = this.ethereum.decodeParameter({ root: { abi } }, data)
    return { collectionId: result[0][0][0], tokenId: result[0][0][1] }
  }

  mapLazy(abi: object, data: string): AssetId {
    const nft =
      "0x0000000000000000000000000000000000000000000000000000000000000020" +
      data.substring(2)
    const result = this.ethereum.decodeParameter(abi, nft)
    return { collectionId: result[0][0], tokenId: result[0][1][0] }
  }
}

export const assetDecoderService = new AssetDecoderService(ethereum)
