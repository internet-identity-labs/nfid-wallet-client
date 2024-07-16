import { AssetDecoder, AssetId } from "../asset-decoder"
import {
  assetDecoderService,
  AssetDecoderService,
  AssetType,
} from "../asset-decoder-service"
import { erc721AssetLazyAbi } from "./erc721-asset-lazy-abi"

class Erc721AssetLazyDecoder implements AssetDecoder {
  private AssetDecoderService: AssetDecoderService

  constructor(AssetDecoderService: AssetDecoderService) {
    this.AssetDecoderService = AssetDecoderService
  }

  getAbi(): object {
    return erc721AssetLazyAbi
  }

  getMethod(): string {
    return AssetType.ERC721_LAZY
  }

  map(data: string): AssetId {
    return this.AssetDecoderService.mapLazy(this.getAbi(), data)
  }
}

export const erc721AssetLazyDecoder = new Erc721AssetLazyDecoder(
  assetDecoderService,
)
