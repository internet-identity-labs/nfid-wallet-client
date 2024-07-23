import {MarketPlace} from "src/integration/nft/enum/enums";
import {MappedToken} from "src/integration/nft/geek/geek-types";
import {AssetPreview} from "src/integration/nft/impl/nft-types";
import {encodeTokenIdentifier} from "ictool";
import {NFT, NFTDetails} from "src/integration/nft/nft";

export abstract class NftImpl implements NFT {
  private readonly millis: number;
  private readonly marketPlace: MarketPlace;
  private readonly tokenNumber: number;
  private readonly tokenId: string;
  private readonly collectionId: string;
  private readonly collectionName: string;
  private readonly tokenName: string;
  private readonly tokenFloorPriceICP?: number;
  private readonly tokenFloorPriceUSD?: number;

  protected assetPreview: AssetPreview | undefined
  protected details: NFTDetails | undefined

  public constructor(geekData: MappedToken) {
    this.millis = geekData.millis;
    this.marketPlace = geekData.marketPlace;
    this.tokenNumber = geekData.tokenId;
    this.collectionId = geekData.collectionId;
    this.collectionName = geekData.collectionName;
    this.tokenName = `${this.collectionName} # ${this.tokenNumber}`
    this.tokenFloorPriceICP = geekData.tokenFloorPriceIcp;
    this.tokenFloorPriceUSD = geekData.tokenFloorPriceUSD;
    this.tokenId = encodeTokenIdentifier(this.collectionId, this.tokenNumber)
  }

  getMillis(): number {
    return this.millis;
  }

  getMarketPlace(): MarketPlace {
    return this.marketPlace;
  }

  getTokenId(): string {
    return this.tokenId;
  }

  getTokenNumber(): number {
    return this.tokenNumber;
  }

  getCollectionId(): string {
    return this.collectionId;
  }

  getCollectionName(): string {
    return this.collectionName;
  }

  getTokenName(): string {
    return this.tokenName;
  }

  getTokenFloorPriceIcp(): number | undefined {
    return this.tokenFloorPriceICP;
  }

  getTokenFloorPriceUSD(): number | undefined {
    return this.tokenFloorPriceUSD;
  }

  abstract getTokenLink(): string;

  abstract getDetails(): Promise<NFTDetails>;

  abstract getAssetPreview(): AssetPreview;
}


export abstract class NFTDetailsImpl implements NFTDetails {
  protected assetFullSize: Promise<AssetPreview> | undefined
  abstract getAbout(): string;
  abstract getAssetFullSize(): Promise<AssetPreview>;
}
