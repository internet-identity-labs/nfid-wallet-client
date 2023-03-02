/**
 * tries to laod the delegation ttl from the local storage key NFID_DELEGATION_TTL
 * if not found, it will return the given defaultTTL value

 * @param defaultTTL - in mili seconds
 */
export function getDelegationTTL(
  defaultTTL: number,
  localStorageKey = "NFID_DELEGATION_TTL",
): number {
  console.debug("loadProfileFromLocalStorage")
  const ttl = parseInt(window.localStorage.getItem(localStorageKey) || "")
  if (!ttl) return defaultTTL
  console.debug(`getDelegationTTL found ttl in local storage: ${ttl}`)

  return ttl
}
