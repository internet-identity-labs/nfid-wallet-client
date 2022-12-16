import { Principal } from "@dfinity/principal"

import { Balance } from "@nfid/integration"

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
  account: {
    domain: string
    accountId: string
  }
}
