import { getScope } from "@nfid/integration"

const loadAddressCache = () => {
  return localStorage.getItem("nfid_address_cache")
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

export const createAddress = ({ hostname, accountId, address }: CreateAddressArg) => {
  const cache = loadAddressCache()
  const parsedCache = cache ? JSON.parse(cache) : {}
  const scope = getScope(hostname, accountId)
  parsedCache[scope] = address
  localStorage.setItem("nfid_address_cache", JSON.stringify(parsedCache))
}

export const readAddress = ({ hostname, accountId }: ReadAddressArg): string | undefined => {
  const cache = loadAddressCache()
  if (!cache) return undefined
  const parsedCache = JSON.parse(cache)
  const scope = getScope(hostname, accountId)
  return parsedCache[scope]
}
