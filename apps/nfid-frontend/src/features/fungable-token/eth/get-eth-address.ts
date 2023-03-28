import { createAddress, readAddress } from "@nfid/client-db"
import {
  replaceActorIdentity,
  ecdsaSigner,
  ethereumAsset,
} from "@nfid/integration"

import { getWalletDelegation } from "frontend/integration/facade/wallet"

export const getEthAddress = async (anchor: number) => {
  const hostname = "nfid.one"
  const accountId = "1"

  const cachedAddress = readAddress({
    accountId: accountId,
    hostname: hostname,
  })

  if (cachedAddress) return cachedAddress

  const identity = await getWalletDelegation(anchor, hostname, accountId)
  replaceActorIdentity(ecdsaSigner, identity)

  const address = await ethereumAsset.getAddress()

  !cachedAddress && createAddress({ address, accountId, hostname })

  return address
}
