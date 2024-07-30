import { Principal } from "@dfinity/principal"

import { Account } from "@nfid/integration"

import { Blockchain } from "frontend/ui/connnector/types"

export interface NonFungibleToken {
  blockchain: Blockchain
  name: string
  index: string | number
  tokenId: string
  contractId: string // same as canister id for ic
  assetPreview: {
    format: "video" | "img" | "iframe"
    url: string
  }
  assetFullsize: {
    format: "video" | "img" | "iframe"
    url: string
  }
  collection: NonFungibleCollection
  clipboardText?: string
  blockchainLogo: string
  owner: string
  walletName?: string
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
