export interface CollectionMeta {
  isRarityExists: boolean
}

export interface Collection {
  _id: string
  slug: string
  chain: string
  collectionName: string
  collectionDescription: string
  marketplaceAddress: string
  supply: number
  floorPrice: number
  collectionOnChainPublicAddress: string
  artistRoyaltyPercentage: number
  marketplacefeePercentage: number
  nftStandard: string
  collectionCreatorAddress: string
  meta: CollectionMeta
}

export interface TokenMetadataProperties {
  creators: string[]
}

export interface TokenMetadata {
  properties: TokenMetadataProperties
  name: string
  symbol: string
  image: string
  attributes: any[] // Replace 'any' with a specific type if attributes have a defined structure
}

export interface Token {
  tokenMetadata: TokenMetadata
  tokenPropertyVersion: number
  _id: string
  tokenIndex: number
  tokenName: string
  tokenAddress: string
  image: string
  thumb: string
  isListed: boolean
  rarityIndex: number
  listedDate: string
  listedPrice: number
  tokenOwnerAddress: string
}

export interface MemeCakeApiResponse {
  status: number
  code: string
  data: {
    collection: Collection
    token: Token
  }
  message: string
}
