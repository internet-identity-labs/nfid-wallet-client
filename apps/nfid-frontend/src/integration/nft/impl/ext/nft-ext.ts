import {NFTDetails, TransactionRecord} from "src/integration/nft/nft";
import {assetFullsize, entrepotAsset, fetchCollection, getTokenLink} from "src/integration/entrepot/lib";
import {EntrepotCollection} from "src/integration/entrepot/types";
import {AssetPreview} from "../nft-types";
import {NFTDetailsImpl, NftImpl} from "src/integration/nft/impl/nft-abstract";
import {getTokenTxHistoryOfTokenIndex} from "src/integration/cap/fungible-transactions";
import {extTransactionMapper} from "src/integration/nft/impl/transaction/ext/ext-transaction-mapper";


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

  async getTransactions(from: number, to: number): Promise<{ activity: Array<TransactionRecord>; isLastPage: boolean }> {
    const {txHistory, isLastPage} = await getTokenTxHistoryOfTokenIndex(
      this.collection.id,
      this.tokenId,
      from,
      to
    );
    const activity = txHistory.map((raw) => extTransactionMapper.toTransactionRecord(raw))
      .filter((tx): tx is TransactionRecord => tx !== null);
    return {
      activity,
      isLastPage,
    };
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
