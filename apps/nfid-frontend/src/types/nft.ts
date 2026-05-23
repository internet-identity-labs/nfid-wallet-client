import { Principal } from "@icp-sdk/core/principal"

import { Account } from "@nfid/integration"

export interface INFT {
  canisterId: string
  tokenId: string
  imageUrl: string
  owner: string
  principal: Principal
  account: Account
}
