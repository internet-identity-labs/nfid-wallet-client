import { Principal } from "@dfinity/principal"

import { Account } from "@nfid/integration"
import { Blockchain } from "@nfid/integration/token/types"

// External Entrepot types
export interface EntrepotCollection {
  id: string
  priority: number
  name: string
  brief: string
  description: string
  blurb: string
  keywords: string
  web: string
  telegram: string
  discord: string
  twitter: string
  medium: string
  dscvr: string
  distrikt: string
  banner: string
  avatar: string
  collection: string
  route: string
  commission: number
  legacy: string
  unit: string
  nftv: boolean
  mature: boolean
  market: boolean
  dev: boolean
  external: boolean
  filter: boolean
  sale: boolean
  earn: boolean
  saletype: string
  standard: string
  detailpage?: EntrepotDisplayFormat
  nftlicense: string
  kyc: boolean
}

export interface EntrepotToken {
  canisterId: string
  tokenId: string
  imageUrl: string
  owner: string
}

export type EntrepotDisplayFormat =
  | "generative_assets_on_nft_canister" // Image tag
  | "interactive_nfts_or_videos" // Iframe
  | "videos_that_dont_fit_in_frame" // Video
  | "asset_canisters" // Image tag
  | "motoko_mechs" // Special
  | "default" // Image tag
  | ""

// Internal types

export interface CollectionCache {
  [key: string]: EntrepotCollection
}

export interface TokenCache {
  [key: string]: EntrepotToken[]
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
