import {NFTDetails} from "src/integration/nft/nft";
import {assetFullsize, entrepotAsset, fetchCollection, getTokenLink} from "src/integration/entrepot/lib";
import {EntrepotCollection} from "src/integration/entrepot/types";
import {AssetPreview} from "./nft-types";
import {NFTDetailsImpl, NftImpl} from "src/integration/nft/impl/nft-abstract";


export class NFTExt extends NftImpl {
  async getDetails(): Promise<NFTDetails> {
    if (this.details === undefined) {
      return fetchCollection(this.getCollectionId())
        .then((collection) => {
          this.details = new NFTExtDetails(collection, this.getTokenId())
          return this.details
        })
    }
    return this.details;
  }

  getAssetPreview(): AssetPreview {
    if (this.assetPreview === undefined) {
      let url = entrepotAsset(this.getCollectionId(), this.getTokenId(), false);
      return {
        format: "img",
        url: url
      }
    } else {
      return this.assetPreview;
    }
  }

  getTokenLink(): string {
    return getTokenLink(this.getCollectionId(), this.getTokenNumber());
  }
}


class NFTExtDetails extends NFTDetailsImpl {

  private readonly collection: EntrepotCollection;
  private readonly tokenId: string

  constructor(collection: EntrepotCollection, tokenId: string) {
    super();
    this.collection = collection;
    this.tokenId = tokenId;
  }

  getAbout(): string {
    return this.collection.description;
  }

  async getAssetFullSize(): Promise<AssetPreview> {
    if (this.assetFullSize === undefined) {
      this.assetFullSize = assetFullsize(this.getCollection(), this.tokenId);
      return this.assetFullSize;
    } else {
      return this.assetFullSize;
    }
  }

  private getCollection(): EntrepotCollection {
    return this.collection;
  }
}
