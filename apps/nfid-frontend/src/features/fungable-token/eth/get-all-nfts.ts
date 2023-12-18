import { ethereumAsset } from "@nfid/integration"

import { getWalletDelegation } from "frontend/integration/facade/wallet"
import { fetchProfile } from "frontend/integration/identity-manager"

export const getAllEthNFTs = async () => {
  const hostname = "nfid.one"
  const accountId = "0"
  const profile = await fetchProfile()
  const delegation = await getWalletDelegation(
    profile?.anchor,
    hostname,
    accountId,
  )

  const { items } = await ethereumAsset.getItemsByUser({
    identity: delegation,
  })

  return items
}
