import { AssetDecoder, AssetId } from "../asset-decoder"
import {
  assetDecoderService,
  AssetDecoderService,
  AssetType,
} from "../asset-decoder-service"
import { erc1155AssetLazyAbi } from "./erc1155-asset-lazy-abi"

class Erc1155TokenLazyDecoder implements AssetDecoder {
  private AssetDecoderService: AssetDecoderService

  constructor(AssetDecoderService: AssetDecoderService) {
    this.AssetDecoderService = AssetDecoderService
  }

  getAbi(): object {
    return erc1155AssetLazyAbi
  }

  getMethod(): string {
    return AssetType.ERC1155_LAZY
  }

  map(data: string): AssetId {
    return this.AssetDecoderService.mapLazy(this.getAbi(), data)
  }
}

export const erc1155TokenLazyDecoder = new Erc1155TokenLazyDecoder(
  assetDecoderService,
)
