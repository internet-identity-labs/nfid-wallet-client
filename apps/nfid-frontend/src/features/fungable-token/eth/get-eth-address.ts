import { storeAddressInLocalCache, readAddressFromLocalCache } from "@nfid/client-db"
import {
  replaceActorIdentity,
  ecdsaSigner,
  ethereumAsset,
} from "@nfid/integration"

import { getWalletDelegation } from "frontend/integration/facade/wallet"

export const getEthAddress = async (anchor: number) => {
  const hostname = "nfid.one"
  const accountId = "0"

  const cachedAddress = readAddressFromLocalCache({
    accountId: accountId,
    hostname: hostname,
  })

  if (cachedAddress) return cachedAddress

  const identity = await getWalletDelegation(anchor, hostname, accountId)
  replaceActorIdentity(ecdsaSigner, identity)

  const address = await ethereumAsset.getAddress()

  !cachedAddress && storeAddressInLocalCache({ address, accountId, hostname })

  return address
}
