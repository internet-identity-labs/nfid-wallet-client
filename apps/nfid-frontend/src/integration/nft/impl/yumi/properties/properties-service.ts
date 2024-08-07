import {
  MappedValue,
  TokenProperties,
} from "src/integration/nft/impl/nft-types"
import { NftMetadata } from "src/integration/nft/impl/yumi/transaction/yumi-trs-types"

export class YumiPropertiesService {
  async getProperties(nftMetadata: NftMetadata): Promise<TokenProperties> {
    if (!nftMetadata.attributes) {
      return {
        mappedValues: [],
      }
    }
    const mappedValues: MappedValue[] = nftMetadata.attributes.map((attr) => ({
      category: attr.trait_type,
      option: attr.value,
    }))
    return {
      mappedValues,
    }
  }
}

export const yumiPropertiesService = new YumiPropertiesService()
