import { Principal } from "@dfinity/principal"

import { Account } from "@nfid/integration"

export interface NonFungibleToken {
  blockchain: "Internet Computer" | "Ethereum"
  name: string
  index: string
  tokenId: string
  contractId: string // same as canister id for ic
  assetPreview: string
  assetFullsize: {
    format: "video" | "img" | "iframe"
    url: string
  }
  collection: {
    standard: string
    name: string
    description: string
    id: string
  }
}

export interface UserNonFungibleToken extends NonFungibleToken {
  principal: Principal
  account: Account
}
