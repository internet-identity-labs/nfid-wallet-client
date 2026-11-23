import { NFTDetailsImpl, NftImpl } from "src/integration/nft/impl/nft-abstract"
import {
  AssetPreview,
  NFTTransactions,
  TokenProperties,
} from "src/integration/nft/impl/nft-types"
import { NFTDetails } from "src/integration/nft/nft"
import { IcpNftToken } from "src/integration/nft/sources/nft-sources-types"

import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

/** Shown when neither the token nor the collection has an image. */
export const ICRC7_PLACEHOLDER_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgNDAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2U1ZTdlYiIvPjwvc3ZnPg=="

/** An NFT of an ICRC-7 collection registered in the marketplace oracle. */
export class NftIcrc7 extends NftImpl {
  private readonly image: string
  private readonly about: string

  constructor(token: IcpNftToken) {
    super(token)
    this.image = token.image ?? token.collectionLogo ?? ICRC7_PLACEHOLDER_IMAGE
    this.about = token.description ?? ""
  }

  async getDetails(): Promise<NFTDetails> {
    if (!this.details) {
      this.details = new NftIcrc7Details(this.about, this.image)
    }
    return this.details
  }

  /** ICRC-7 NFTs are traded in the wallet, not on an external marketplace. */
  getTokenMarketPlaceLink(): string {
    return ""
  }

  getCollectionMarketPlaceLink(): string {
    return ""
  }

  getTokenLink(): string {
    return this.image
  }

  getChainId(): ChainId {
    return ChainId.ICP
  }

  getNftStandard(): string {
    return "ICRC-7"
  }

  protected getAssetPreviewAsync(): Promise<AssetPreview> {
    return Promise.resolve({ format: "img", url: this.image })
  }
}

class NftIcrc7Details extends NFTDetailsImpl {
  constructor(
    private readonly about: string,
    private readonly image: string,
  ) {
    super()
  }

  getAbout(): string {
    return this.about
  }

  getAssetFullSize(): Promise<AssetPreview> {
    return Promise.resolve({ format: "img", url: this.image })
  }

  getTransactions(): Promise<NFTTransactions> {
    return Promise.resolve({ activity: [], isLastPage: true })
  }

  getProperties(): Promise<TokenProperties> {
    return Promise.resolve({ mappedValues: [] })
  }
}
