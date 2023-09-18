import { localStorageWithFallback } from "@nfid/client-db"

/**
 * tries to laod the delegation ttl from the local storage key NFID_DELEGATION_TTL
 * if not found, it will return the given defaultTTL value

 * @param defaultTTL - in mili seconds
 * @param defaultLocalStorageKey - in mili seconds
 */
export function getLocalStorageOverride(
  defaultTTL: number,
  defaultLocalStorageKey = "NFID_DELEGATION_TTL",
): number {
  const ttl = parseInt(
    localStorageWithFallback.getItem(defaultLocalStorageKey) || "",
  )

  if (ttl) {
    console.debug("getLocalStorageOverride", {
      ttl,
      defaultTTL,
      defaultLocalStorageKey,
    })
    return ttl
  }

  return defaultTTL
}
