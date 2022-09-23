import { Principal } from "@dfinity/principal"

import { Account } from "frontend/integration/identity-manager"

export interface INFT {
  canisterId: string
  tokenId: string
  imageUrl: string
  owner: string
  principal: Principal
  account: Account
}
