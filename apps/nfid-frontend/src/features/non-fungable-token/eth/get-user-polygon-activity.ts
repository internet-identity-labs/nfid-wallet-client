import {loadProfileFromLocalStorage, polygonAsset} from "@nfid/integration"

import {getWalletDelegation} from "frontend/integration/facade/wallet"
import {fetchProfile} from "frontend/integration/identity-manager"

//WIP have to be moved to connector layer
export const getUserPolygonNFTActivity = async () => {
  const hostname = "nfid.one"
  const accountId = "0"
  const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())
  const delegation = await getWalletDelegation(
    profile?.anchor,
    hostname,
    accountId,
  )

  return await polygonAsset.getActivitiesByUser({identity: delegation})
}
