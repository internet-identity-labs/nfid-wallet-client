import { getScope } from "@nfid/integration"

import { STORAGE_KEY } from "./constants"
import { CachedAddresses } from "./types"

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

type ReadAddressArg = KeyArgs

type CreateAddressArg = KeyArgs & {
  address: string
}

export const getKey = ({ hostname, accountId, anchor }: KeyArgs) => {
  const scope = getScope(hostname, accountId)
  const key = `${anchor}:${scope}`
  return key
}

export const storeAddressInLocalCache = ({
  hostname,
  anchor,
  accountId,
  address,
}: CreateAddressArg) => {
  const cache = loadAddressCache()
  const key = getKey({ hostname, anchor, accountId })
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...cache, [key]: address }),
  )
}

export const readAddressFromLocalCache = ({
  accountId,
  anchor,
  hostname,
}: ReadAddressArg): string | undefined => {
  const cache = loadAddressCache()
  const key = getKey({ hostname, accountId, anchor })
  return cache[key]
}
