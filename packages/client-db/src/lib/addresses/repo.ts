import { getScope } from "@nfid/integration"

import { STORAGE_KEY } from "./constants"
import { CachedAddresses, NetworkKey } from "./types"

const loadAddressCache = (): CachedAddresses => {
  const cache = localStorage.getItem(STORAGE_KEY)
  const parsedCache = cache ? JSON.parse(cache) : {}
  return parsedCache
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
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...cache, [key]: { ...existing, [network]: address } }),
  )
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
