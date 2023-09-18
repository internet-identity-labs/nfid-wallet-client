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
  let ttl: number | undefined
  try {
    ttl = parseInt(window.localStorage.getItem(defaultLocalStorageKey) || "")
  } catch (e) {
    console.error("getLocalStorageOverride", {
      defaultTTL,
      defaultLocalStorageKey,
      error: e,
    })
  }

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
