import { getScope } from "@nfid/integration"

import { CachedAddresses } from "./types"

const loadAddressCache = (): CachedAddresses => {
  const cache = localStorage.getItem("nfid_address_cache")
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

export const createAddress = ({
  hostname,
  accountId,
  address,
}: CreateAddressArg) => {
  const cache = loadAddressCache()
  const scope = getScope(hostname, accountId)
  localStorage.setItem(
    "nfid_address_cache",
    JSON.stringify({ ...cache, [scope]: address }),
  )
}

export const readAddress = ({
  hostname,
  accountId,
}: ReadAddressArg): string | undefined => {
  const cache = loadAddressCache()
  const scope = getScope(hostname, accountId)
  return cache[scope]
}
