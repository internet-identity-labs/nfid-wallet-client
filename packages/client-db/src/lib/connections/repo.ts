import { STORAGE_KEY } from "./constants"
import { CachedConnections, ConnectionDetails } from "./types"

const loadAddressCache = (): CachedConnections => {
  try {
    const cache = localStorage.getItem(STORAGE_KEY)
    const parsedCache = cache ? JSON.parse(cache) : {}
    return parsedCache
  } catch (error) {
    console.error("loadAddressCache", { error })
    return {}
  }
}

type CreateConnectionArg = {
  connectionDomain: string
  accountId: string
  domain: string
}

export const createConnection = ({
  connectionDomain,
  accountId,
  domain,
}: CreateConnectionArg) => {
  const cache = loadAddressCache()
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...cache,
        [connectionDomain]: {
          accountId,
          domain,
        },
      }),
    )
  } catch (error) {
    console.error("createConnection", { error })
  }
}

type ReadConnectionArg = {
  connectionDomain: string
}

export const readConnection = ({
  connectionDomain,
}: ReadConnectionArg): ConnectionDetails | undefined => {
  const cache = loadAddressCache()
  return cache[connectionDomain]
}
