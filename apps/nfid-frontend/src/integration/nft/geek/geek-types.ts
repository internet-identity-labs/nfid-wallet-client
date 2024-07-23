import {MarketPlace} from "src/integration/nft/enum/enums";

export interface MappedToken {
  millis: number;
  marketPlace: MarketPlace;
  tokenId: number;
  collectionId: string;
  collectionName: string;
  tokenFloorPriceIcp?: number;
  tokenFloorPriceUSD?: number;
}

export interface DataStructure {
  registry: Registry;
  collections: Collection[];
}

interface UniqueIdentifier {
  uniqueIdentifierType: string;
  id: string;
}

interface Token {
  timeMillis: number;
  tokenId: number;
  uniqueIdentifier: UniqueIdentifier;
}

interface RegistryItem {
  tokens: Token[];
  tokenFloorPriceIcp?: number;
  tokenFloorPriceUsd?: number;
}

interface Collection {
  canisterId: string;
  name: string;
  alias: string;
  interface: MarketPlace;
}

interface Registry {
  [canisterId: string]: RegistryItem;
}

