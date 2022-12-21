import { Principal } from "@dfinity/principal"

export type Balance = bigint

export interface IWallet {
  label?: string
  principal?: Principal
  accountId: string
  domain: string
  balance: Balance
}

export type NFT = {
  assetPreview: string
  name: string
  tokenId: string
  collection: {
    name: string
  }
  principal: Principal
  walletName: string
}
