import { getScope } from "@nfid/integration"

import { STORAGE_KEY } from "./constants"
import { CachedAddresses } from "./types"

const loadAddressCache = (): CachedAddresses => {
  const cache = localStorage.getItem(STORAGE_KEY)
  const parsedCache = cache ? JSON.parse(cache) : {}
  return parsedCache
}

type ReadAddressArg = {
  hostname: string
  accountId: string
}

type CreateAddressArg = {
  hostname: string
  accountId: string
  address: string
}

export const storeAddressInLocalCache = ({
  hostname,
  accountId,
  address,
}: CreateAddressArg) => {
  const cache = loadAddressCache()
  const scope = getScope(hostname, accountId)
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...cache, [scope]: address }),
  )
}

export const readAddressFromLocalCache = ({
  hostname,
  accountId,
}: ReadAddressArg): string | undefined => {
  const cache = loadAddressCache()
  const scope = getScope(hostname, accountId)
  return cache[scope]
}
