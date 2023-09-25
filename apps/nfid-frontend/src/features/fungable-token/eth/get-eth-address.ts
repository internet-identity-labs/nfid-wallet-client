import {
  storeAddressInLocalCache,
  readAddressFromLocalCache,
  NetworkKey,
} from "@nfid/client-db"
import {
  replaceActorIdentity,
  ecdsaSigner,
  ethereumGoerliAsset,
  authState,
} from "@nfid/integration"

export const getEthAddress = async (anchor: number) => {
  const hostname = "nfid.one"
  const accountId = "0"

  const cachedAddress = readAddressFromLocalCache({
    accountId: accountId,
    hostname: hostname,
    anchor: BigInt(anchor),
    network: NetworkKey.EVM,
  })

  if (cachedAddress) return cachedAddress

  const identity = authState.get().delegationIdentity
  if (!identity) throw new Error("Identity not found")

  replaceActorIdentity(ecdsaSigner, identity)

  const address = await ethereumGoerliAsset.getAddress(identity)

  !cachedAddress &&
    storeAddressInLocalCache({
      address,
      accountId,
      hostname,
      anchor: BigInt(anchor),
      network: NetworkKey.EVM,
    })

  return address
}
