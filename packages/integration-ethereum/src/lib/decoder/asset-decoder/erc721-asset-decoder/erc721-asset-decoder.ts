import { assetAbi } from "../asset-abi"
import { AssetDecoder, AssetId } from "../asset-decoder"
import {
  assetDecoderService,
  AssetDecoderService,
  AssetType,
} from "../asset-decoder-service"

class Erc721AssetDecoder implements AssetDecoder {
  private assetDecoderService: AssetDecoderService

  constructor(assetDecoderService: AssetDecoderService) {
    this.assetDecoderService = assetDecoderService
  }

  getAbi(): object {
    return assetAbi
  }

  getMethod(): string {
    return AssetType.ERC721
  }

  map(data: string): AssetId {
    return this.assetDecoderService.map(this.getAbi(), data)
  }
}

export const erc721AssetDecoder = new Erc721AssetDecoder(assetDecoderService)
