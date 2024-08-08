import {
  MappedValue,
  TokenProperties,
} from "src/integration/nft/impl/nft-types"

import { IcsMetadata } from "../idl/SwapNFT.d"

type NFTMetadata1 = { label: string; value: string }
type NFTMetadata2 = { k: string; v: string }
type NFTMetadata = NFTMetadata1 | NFTMetadata2

export class IcpSwapPropertiesService {
  async getProperties(icsMetadata: IcsMetadata): Promise<TokenProperties> {
    const formattedResponse = this.metadataFormatRawResponse(icsMetadata)
    return this.metadataFormat(formattedResponse)
  }

  private metadataFormatRawResponse(metadata: IcsMetadata): NFTMetadata[] {
    if (!!metadata.metadata && !!metadata.metadata[0]) {
      return JSON.parse(
        this.arrayBufferToString(Uint8Array.from(metadata.metadata[0])),
      )
    }
    return []
  }

  private isNFTMetadata1(metadata: NFTMetadata): metadata is NFTMetadata1 {
    return (metadata as NFTMetadata1).label !== undefined
  }

  private metadataFormat(metadata: NFTMetadata[]): TokenProperties {
    const mappedValues: MappedValue[] = metadata.map((item) => {
      if (this.isNFTMetadata1(item)) {
        return { category: item.label, option: item.value }
      } else {
        return { category: item.k, option: item.v }
      }
    })

    return { mappedValues }
  }

  arrayBufferToString(arrayBuffer: Uint8Array): string {
    return new TextDecoder("utf-8").decode(arrayBuffer)
  }
}

export const icpSwapPropertiesService = new IcpSwapPropertiesService()
