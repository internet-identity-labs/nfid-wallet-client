import { getScope } from "@nfid/integration"

import { localStorageWithFallback } from "../local-storage"
import { STORAGE_KEY } from "./constants"
import { CachedAddresses, NetworkKey } from "./types"

const loadAddressCache = (): CachedAddresses => {
  try {
    const cache = localStorageWithFallback.getItem(STORAGE_KEY)
    const parsedCache = cache ? JSON.parse(cache) : {}
    return parsedCache
  } catch (error) {
    console.error("loadAddressCache", { error })
    return {}
  }
}

type KeyArgs = {
  anchor: bigint
  accountId: string
  hostname: string
}

type NetworkArgs = {
  network: NetworkKey
}

type ReadAddressArg = KeyArgs & NetworkArgs

type CreateAddressArg = KeyArgs &
  NetworkArgs & {
    address: string
  }

export const getKey = ({ hostname, accountId, anchor }: KeyArgs) => {
  const scope = getScope(hostname, accountId)
  const key = `${anchor}:${scope}`
  return key
}

const getEntity = (key: string): { [key: string]: string } => {
  const cache = loadAddressCache()
  return typeof cache[key] === "object" ? cache[key] : {}
}

export const storeAddressInLocalCache = ({
  hostname,
  anchor,
  accountId,
  address,
  network,
}: CreateAddressArg) => {
  const cache = loadAddressCache()
  const key = getKey({ hostname, anchor, accountId })
  const existing = getEntity(key)
  try {
    localStorageWithFallback.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...cache, [key]: { ...existing, [network]: address } }),
    )
  } catch (error) {
    console.error("storeAddressInLocalCache", { error })
  }
}

export const readAddressFromLocalCache = ({
  accountId,
  anchor,
  hostname,
  network,
}: ReadAddressArg): string | undefined => {
  const key = getKey({ hostname, accountId, anchor })
  const entity = getEntity(key)
  return entity[network]
}
