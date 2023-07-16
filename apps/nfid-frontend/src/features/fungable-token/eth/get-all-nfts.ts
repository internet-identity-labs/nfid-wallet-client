import {
  ethereumGoerliAsset,
  loadProfileFromLocalStorage,
} from "@nfid/integration"

import { getWalletDelegation } from "frontend/integration/facade/wallet"
import { fetchProfile } from "frontend/integration/identity-manager"

export const getAllEthNFTs = async () => {
  const hostname = "nfid.one"
  const accountId = "0"
  const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())
  // FIXME:
  // what to do here
  const delegation = await getWalletDelegation(
    profile?.anchor,
    hostname,
    accountId,
  )

  const { items } = await ethereumGoerliAsset.getItemsByUser({
    identity: delegation,
  })

  return items
}
