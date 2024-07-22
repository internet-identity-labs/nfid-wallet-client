import {MarketPlace} from "src/integration/nft/enums";
import {Blockchain} from "src/ui/connnector/types";
import {Principal} from "@dfinity/principal";
import {Account} from "@nfid/integration";
import {EntrepotCollection} from "src/integration/entrepot/types";

export abstract class NFT {

  private readonly millis: number;
  private readonly marketPlace: MarketPlace;
  private readonly tokenId: number;
  private readonly collectionId: string;
  private readonly collectionName: string;
  private readonly tokenName: string;

  constructor() {
  }

  abstract init(): Promise<void>;

  abstract get marketPlace(): MarketPlace;
  abstract get tokenId(): number;
  abstract get collectionId(): number;
  abstract get name() {
    return this.name;
  };
  abstract get image(): NFTImage
  abstract get details(): NFTDetails;
}

export interface NFTDetails {
  canisterId: string
  index: number
  tokenId: string
  name: string
  assetPreview: {
    url: string
    format: DisplayFormat
  }
  assetFullsize: {
    url: string
    format: DisplayFormat
  }
  collection: EntrepotCollection
  owner?: string
  blockchain: Blockchain
}

export interface UserNFTDetails extends NFTDetails {
  principal: Principal
  account: Account
}

export type DisplayFormat = "img" | "iframe" | "video"


export abstract class NFTImage {
  abstract get imageUrl(): string;
}

export class NftIcpSwap implements NFT {
  constructor(tokenId: number) {
    this.marketPlace = MarketPlace.ICPSWAP
    this.tokenId = tokenId
  }

  readonly marketPlace: MarketPlace;
  readonly tokenId: number;
}
