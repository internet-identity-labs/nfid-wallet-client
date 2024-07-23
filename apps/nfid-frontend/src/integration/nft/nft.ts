import {MarketPlace} from "src/integration/nft/enum/enums";
import {AssetPreview} from "src/integration/nft/impl/nft-types";

export interface NFT {
  getMillis(): number;
  getMarketPlace(): MarketPlace;
  getTokenId(): string;
  getTokenNumber(): number;
  getCollectionId(): string;
  getCollectionName(): string;
  getTokenName(): string;
  getTokenFloorPriceIcp(): number | undefined;
  getTokenFloorPriceUSD(): number | undefined;
  getTokenLink(): string;
  getDetails(): Promise<NFTDetails>;
  getAssetPreview(): AssetPreview;
}

export interface NFTDetails {
  getAbout(): string;
  getAssetFullSize(): Promise<AssetPreview>;
}
