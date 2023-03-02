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
    window.localStorage.getItem(defaultLocalStorageKey) || "",
  )
  if (!ttl) {
    console.debug("getLocalStorageOverride", {
      defaultTTL,
      defaultLocalStorageKey,
    })
    return defaultTTL
  }
  console.debug("getLocalStorageOverride", {
    defaultTTL,
    overrideTTL: ttl,
    defaultLocalStorageKey,
  })

  return ttl
}
