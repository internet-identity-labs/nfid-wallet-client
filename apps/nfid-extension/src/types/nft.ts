import { Principal } from "@dfinity/principal"

import { Account } from "@nfid/integration"

export interface INFT {
  canisterId: string
  tokenId: string
  imageUrl: string
  owner: string
  principal: Principal
  account: Account
}
