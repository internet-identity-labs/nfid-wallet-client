import { Principal } from "@dfinity/principal"

import { Account } from "frontend/integration/identity-manager"

export interface EntrepotNFTData {
  canisterId: string
  tokenId: string
  imageUrl: string
  owner: string
}

export interface NFTData {
  canisterId: string
  tokenId: string
  imageUrl: string
  owner: string
  principal: Principal
  account: Account
}

export interface NFTDetails {
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
  detailpage: string
  nftlicense: string
  kyc: boolean
}
