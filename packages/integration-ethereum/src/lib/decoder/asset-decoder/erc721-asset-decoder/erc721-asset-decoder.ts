import { assetAbi } from "../asset-abi"
import { AssetDecoder, AssetId } from "../asset-decoder"
import {
  assetDecoderService,
  AssetDecoderService,
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
    return "0x73ad2146"
  }

  map(data: string): AssetId {
    return this.assetDecoderService.map(this.getAbi(), data)
  }
}

export const erc721AssetDecoder = new Erc721AssetDecoder(assetDecoderService)
