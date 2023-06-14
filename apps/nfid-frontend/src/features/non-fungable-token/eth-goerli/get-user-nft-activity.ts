import {
  ethereumGoerliAsset,
  loadProfileFromLocalStorage,
} from "@nfid/integration"

import { getWalletDelegation } from "frontend/integration/facade/wallet"
import { fetchProfile } from "frontend/integration/identity-manager"

export const getUserEthGoerliNFTActivity = async () => {
  const hostname = "nfid.one"
  const accountId = "0"
  const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())
  const delegation = await getWalletDelegation(
    profile?.anchor,
    hostname,
    accountId,
  )

  return await ethereumGoerliAsset.getActivitiesByUser({ identity: delegation })
}
