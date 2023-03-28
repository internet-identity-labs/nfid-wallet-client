import { Principal } from "@dfinity/principal"

import { Account } from "@nfid/integration"

export interface NonFungibleToken {
  blockchain: "Internet Computer" | "Ethereum"
  name: string
  index: string | number
  tokenId: string
  contractId: string // same as canister id for ic
  assetPreview: string
  assetFullsize: {
    format: "video" | "img" | "iframe"
    url: string
  }
  collection: NonFungibleCollection
}

export interface NonFungibleCollection {
  standard: string
  name: string
  description: string
  id: string
  avatar?: string
}

export interface UserNonFungibleToken extends NonFungibleToken {
  principal: Principal
  account: Account
}
